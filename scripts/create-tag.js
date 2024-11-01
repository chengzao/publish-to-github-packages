import { execa } from 'execa';
import fs from 'fs-extra';
import path from 'node:path';
import process from 'node:process';
import pc from "picocolors"

try {
  const packageJsonPath = path.join(process.cwd(), './package.json');
  const packageJson = await fs.readJson(packageJsonPath);
  const version = packageJson.version;

  // check git tag exists
  const { stdout } = await execa`git tag -l v${version}`;
  if (stdout) {
    throw new Error(pc.bgRedBright(`Tag v${version} already exists.`));
  }
  // create git tag
  await execa`git tag rc-${version}`;
  // push git tag
  await execa`git push origin rc-${version}`;
  console.log(pc.bgGreenBright(`Tag v${version} was created and pushed successfully.`));
} catch (error) {
  console.error(pc.bgRedBright('Error during tag creation:'), error);
  console.log(pc.redBright('Please check the logs for more details.'));
  process.exit(1);
}