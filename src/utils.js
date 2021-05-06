const { TwilioCliError } = require('@twilio/cli-core').services.error;

const auto = require("@pulumi/pulumi/automation");
const upath = require("upath");
const fs = require('fs')
const { flags } = require('@oclif/command');

const util = require('util');
const childProcess = require('child_process');
const exec = util.promisify(childProcess.exec);

const Printer = require('./printer');

/**
 * Add environment variable to process.env
 *
 * @param {{}} twilioClient Initialized Twilio Client
 * @param {*?} flags Command flags
 * @param {string?} stack Pulumi stack
 * @return {{}} Environment key-value pairs
 */
function getEnvironmentVariables(twilioClient) {
  let envVars = process.env;
  if (twilioClient) {
    envVars.TWILIO_ACCOUNT_SID = twilioClient.accountSid;
    envVars.TWILIO_AUTH_TOKEN = twilioClient.authToken;
    envVars.TWILIO_USERNAME = twilioClient.username;
    envVars.TWILIO_PASSWORD = twilioClient.password;
  }

  return envVars;
}

/**
 * Execute Pulumi CLI command
 *
 * @param {Array} args Arguments to Pulumi CLI command
 * @param {boolean=true} interactive Whether to run the command in interactive mode (i.e. gathering input from user)
 * @param {{}} twilioClient Initialized Twilio client
 */

async function runPulumiCommand(args, interactive = true, twilioClient) {
  try {
    let envVars = '';
    envVars = getEnvironmentVariables(twilioClient);
    if (interactive) {
      Printer.printHeader('Pulumi CLI output');
      childProcess.execFileSync('pulumi', args, {
        stdio: 'inherit',
        env: getEnvironmentVariables(twilioClient),
      });
      Printer.printHeader('End of Pulumi CLI output');
    } else {
      const { stdout, stderr } = await exec(
        `${envVars} pulumi ${args.join(' ')}`
      );
      if (stderr) {
        if (!stdout) {
          throw new TwilioCliError(stderr);
        }
        Printer.printPulumiError(stderr);
      }
      Printer.printPulumiOutput(stdout);
    }
  } catch (error) {
    throw new TwilioCliError(
      '\n\nError running Pulumi CLI command.\n ** ' + error.message
    );
  }
}

async function runAutomationAPICommand(twilioClient, flags, command) {

  const stackName = flags.stack || "dev";
  const envPath = upath.joinSafe(process.cwd(), flags.envFile || `./.${stackName}.env`);

  const args = {
    stackName,
    workDir: process.cwd()
  };

  let envFile = {};

  if (fs.existsSync(envPath)) {

    const dotenv = require('dotenv').config({ path: envPath });
    envFile = dotenv.parsed;

    console.info(`The following env file was loaded: ${envPath}`)

  } else if(flags.envFile) {

    console.warn("No env file found");

  }

  const stack = await auto.LocalWorkspace.createOrSelectStack(args, { 
    envVars: {
      TWILIO_ACCOUNT_SID: twilioClient.accountSid,
      TWILIO_AUTH_TOKEN: twilioClient.authToken,
      TWILIO_USERNAME: twilioClient.username,
      TWILIO_PASSWORD: twilioClient.password,
      ...envFile
    } 
  });

  await stack[command]({ onOutput: console.info });

}

const defaultFlags = {
  stack: flags.string({
    char: 's',
    description: 'Name of the stack',
  }),
  envFile: flags.string({
    char: 'e',
    description: 'Environment variable file relative path',
  })
}


module.exports = {
  runPulumiCommand,
  runAutomationAPICommand,
  defaultFlags,
  Printer,
};
