const fs = require("fs");
const request = require("request");
const jsonObject = JSON.parse(fs.readFileSync("./__reg__/reg.json", "utf8"));

const {
  GITHUB_REF,
  GITHUB_REPOSITORY,
  GITHUB_RUN_ID,
  GITHUB_TOKEN
} = process.env;
const num = GITHUB_REF.split("/")[2];
const rep = GITHUB_REPOSITORY.split("/");
const url = `https://${rep[0]}.github.io/${rep[1]}/${num}/${GITHUB_RUN_ID}/index.html`;

const body = `
[${url}](${url})
Passed: ${jsonObject.passedItems.length}
Faild: ${jsonObject.failedItems.length}
New: ${jsonObject.newItems.length}
Delete: ${jsonObject.deletedItems.length}
`;

request.post(
  {
    uri: `https://api.github.com/repos/${GITHUB_REPOSITORY}/issues/${num}/comments?access_token=${GITHUB_TOKEN}`,
    headers: {
      "User-Agent": "https://api.github.com/meta",
      "Content-type": "application/json"
    },
    json: { body }
  },
  function(_error, _response, body) {
    console.log(body);
  }
);
