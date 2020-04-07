const { exec, spawn } = require("child_process");
const open = require('open');
const fs = require("fs-extra");
const yarn = process.platform === 'win32' ? 'yarn.cmd' : 'yarn';

const Exec = cmd =>
  new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) =>
      err ? reject({ err, stderr }) : resolve(stdout)
    );
  });
const ExecStream = cmd =>
  new Promise((resolve, _reject) => {
    const params = cmd.split(" ");
    const result = spawn(params[0], params.slice(1), { stdio: "inherit" });
    result.on("close", code => {
      resolve(code);
    });
  });

const outPath = "__reg__";
const branch = process.argv[2] || "master";
(async () => {
  try {
    const url = (await Exec("git remote get-url origin")).replace(/\r?\n/g, "");

    if (fs.existsSync(outPath)) {
      fs.removeSync(outPath);
    }
    fs.mkdirSync(outPath);
    await ExecStream(`${yarn} capture`);
    fs.moveSync("__screenshots__",`${outPath}/actual`)
    await ExecStream(`git clone ${url} -b captures/${branch} ${outPath}/expected`);
    await ExecStream(
      `${yarn} reg-cli ${outPath}/actual ${outPath}/expected ${outPath}/diff -R ${outPath}/index.html -J ${outPath}/reg.json -I -M 0.1`
    );
    open(`${outPath}/index.html`)
  } catch (e) {
    console.error(e);
  }
})();
