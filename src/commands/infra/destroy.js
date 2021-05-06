const { TwilioClientCommand } = require('@twilio/cli-core').baseCommands;
const { TwilioCliError } = require('@twilio/cli-core').services.error;
const { runAutomationAPICommand, defaultFlags, Printer } = require('../../utils');

class InfraDestroy extends TwilioClientCommand {
  async run() {
    await super.run();
    
    try {

      let { flags } = this.parse(InfraDestroy);

      await runAutomationAPICommand(this.twilioClient, flags, "destroy");
    
      Printer.printSuccess('Resource(s) destroyed succesfully!');
  
    } catch (error) {

      throw new TwilioCliError('Error running destroy: ' + error.message);

    }
  }
}

InfraDestroy.description =
  'Destroy an existing stack and the deployed resources';

InfraDestroy.flags = defaultFlags;

module.exports = InfraDestroy;
