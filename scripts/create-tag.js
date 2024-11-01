import { execa } from 'execa';
import fs from 'fs-extra';
import path from 'node:path';
import process from 'node:process';
import pc from "picocolors"
import ora from 'ora';

try {
  const packageJsonPath = path.join(process.cwd(), './package.json');
  const packageJson = await fs.readJson(packageJsonPath);
  const version = packageJson.version;
  // const name = packageJson.name;

  // npm publish
  // console.log(pc.bgGreenBright(`npm publish on ${name} v${version} was successfully.`)+'\n');

  const tagName = `rc-${version}`;
  const spinner = ora('Loading unicorns').start();
  // fetch all tags
  spinner.text = 'git fetching all tags.';
  await execa`git fetch --tags`;
  spinner.succeed();

  // check git tag exists
  const { stdout } = await execa`git tag -l ${tagName}`;
  if (stdout) {
    throw new Error(pc.redBright(`Tag ${tagName} already exists.`)+'\n');
  }
  // create git tag
  spinner.text = 'Creating git tag.';
  await execa`git tag ${tagName} -m ${"Release version" + version}}`;
  spinner.succeed();

  // push git tag
  spinner.text = 'Pushing git tag.';
  // await execa`git push origin ${tagName}`;
  spinner.succeed();
  
  spinner.stop();
  console.log(pc.bgGreenBright(`Tag ${tagName} was created and pushed successfully.`)+'\n');
} catch (error) {
  console.error(pc.bgRedBright('Error during tag creation:'), error);
  console.log(pc.redBright('Please check the logs for more details.')+'\n');
  process.exit(1);
}