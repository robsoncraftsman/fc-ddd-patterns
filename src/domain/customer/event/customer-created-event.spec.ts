import EventDispatcher from "../../@shared/event/event-dispatcher";
import Customer from "../entity/customer";
import CustomerCreatedEvent from "./customer-created-event";
import EnviaConsoleLog1Handler from "./handler/envia-console-log1-handler";
import EnviaConsoleLog2Handler from "./handler/envia-console-log2-handler";

describe("CustomerCreatedEvent tests", () => {
  it("should notify all event handlers", () => {
    const eventDispatcher = new EventDispatcher();

    const enviaConsoleLog1Handler = new EnviaConsoleLog1Handler();
    eventDispatcher.register(CustomerCreatedEvent.name, enviaConsoleLog1Handler);
    const spyEnviaConsoleLog1Handler = jest.spyOn(enviaConsoleLog1Handler, "handle");

    const enviaConsoleLog2Handler = new EnviaConsoleLog2Handler();
    eventDispatcher.register(CustomerCreatedEvent.name, enviaConsoleLog2Handler);
    const spyEnviaConsoleLog2Handler = jest.spyOn(enviaConsoleLog2Handler, "handle");

    const customerCreatedEvent = new CustomerCreatedEvent(new Customer("1", "João"));
    eventDispatcher.notify(customerCreatedEvent);

    expect(spyEnviaConsoleLog1Handler).toHaveBeenCalledWith(customerCreatedEvent);
    expect(spyEnviaConsoleLog2Handler).toHaveBeenCalledWith(customerCreatedEvent);
  });
});
