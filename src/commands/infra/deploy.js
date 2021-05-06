const { TwilioClientCommand } = require('@twilio/cli-core').baseCommands;
const { TwilioCliError } = require('@twilio/cli-core').services.error;
const { runAutomationAPICommand, defaultFlags, Printer } = require('../../utils');

class InfraDeploy extends TwilioClientCommand {
  async run() {
    await super.run();

    try {

      let { flags } = this.parse(InfraDeploy);

      await runAutomationAPICommand(this.twilioClient, flags, "up");

      Printer.printSuccess('Resource(s) were succesfully deployed!');
  
    } catch (error) {

      throw new TwilioCliError('Error running deploy: ' + error.message);

    }
  }
}

InfraDeploy.description =
  'Deploys and updates resources described in this directory to a Twilio project';

InfraDeploy.flags = defaultFlags;

module.exports = InfraDeploy;
