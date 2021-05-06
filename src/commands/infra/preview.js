const { TwilioClientCommand } = require('@twilio/cli-core').baseCommands;
const { TwilioCliError } = require('@twilio/cli-core').services.error;
const { runAutomationAPICommand, defaultFlags } = require('../../utils');

class InfraPreview extends TwilioClientCommand {
  async run() {
    await super.run();

    try {

      let { flags } = this.parse(InfraPreview);

      await runAutomationAPICommand(this.twilioClient, flags, "preview");

    } catch (error) {

      throw new TwilioCliError('Error running deploy: ' + error.message);
      
    }

  }
}

InfraPreview.description =
  'Previews changes related to resources described in this directory and mapped to a Twilio project';

InfraPreview.flags = defaultFlags;

module.exports = InfraPreview;
