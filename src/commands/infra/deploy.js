const { TwilioClientCommand } = require('@twilio/cli-core').baseCommands;
const { TwilioCliError } = require('@twilio/cli-core').services.error;
const { flags } = require('@oclif/command');

const { addInfra } = require('../../infra');
const { runPulumiCommand, getPulumiStack, getEnvironmentDeployment } = require('../../utils');

class InfraDeploy extends TwilioClientCommand {
  async run() {
    await super.run();
    const deployment = getEnvironmentDeployment();
    if (deployment && deployment !== this.twilioClient.accountSid) {
      throw new TwilioCliError(
        `The current stack is already deployed to ${deployment}. Please switch to that profile or define a new environment`,
      );
    }

    const command = ['up'];
    if (this.flags['non-interactive']) {
      command.push('--yes');
    }
    runPulumiCommand(command, true, this.twilioClient);

    try {
      // Store account SID of the project used for deployment
      addInfra(this.twilioClient.accountSid, getPulumiStack(), true);
    } catch (error) {
      throw new TwilioCliError(`Error running deploy: ${error.message}`);
    }
  }
}

InfraDeploy.flags = {
  'non-interactive': flags.boolean({
    char: 'n',
    description: 'Deploys without interactive confirmation.',
  }),
  ...TwilioClientCommand.flags,
};

InfraDeploy.description = 'Deploys and updates resources described in this directory to a Twilio project';

module.exports = InfraDeploy;
