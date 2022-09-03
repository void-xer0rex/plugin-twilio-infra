const { TwilioClientCommand } = require('@twilio/cli-core').baseCommands;
const { TwilioCliError } = require('@twilio/cli-core').services.error;
const { flags } = require('@oclif/command');

const { addInfra } = require('../../infra');

const {
  runPulumiCommand,
  getPulumiStack,
  getEnvironmentDeployment,
} = require('../../utils');

class InfraDeploy extends TwilioClientCommand {
  async run() {
    await super.run();
    let deployment = getEnvironmentDeployment();
    if (deployment && deployment !== super.twilioClient.accountSid) {
      throw new TwilioCliError(
        `The current stack is already deployed to ${deployment}. Please switch to that profile or define a new environment`
      );
    }

    let command = ['up'];
    if (this.flags['non-interactive']) {
      command.push("--yes");
    }
    runPulumiCommand(command, true, super.twilioClient);

    try {
      // Store account SID of the project used for deployment
      addInfra(super.twilioClient.accountSid, getPulumiStack(), true);
    } catch (error) {
      throw new TwilioCliError('Error running deploy: ' + error.message);
    }
  }
}

InfraDeploy.flags = Object.assign(
  {
    'non-interactive': flags.boolean({
      char: 'n',
      description: 'Deploys without interactive confirmation.',
    })
  },
  TwilioClientCommand.flags,
);

InfraDeploy.description =
  'Deploys and updates resources described in this directory to a Twilio project';

module.exports = InfraDeploy;
