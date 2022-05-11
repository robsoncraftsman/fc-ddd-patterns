import EventDispatcher from "../../@shared/event/event-dispatcher";
import Customer from "../entity/customer";
import Address from "../value-object/address";
import CustomerAddressChangedEvent from "./customer-address-changed-event";
import EnviaConsoleLogHandler from "./handler/envia-console-log-handler";

describe("CustomerAddressChangedEvent tests", () => {
  it("should notify all event handlers", () => {
    const eventDispatcher = new EventDispatcher();

    const enviaConsoleLogHandler = new EnviaConsoleLogHandler();
    eventDispatcher.register(CustomerAddressChangedEvent.name, enviaConsoleLogHandler);
    const spyEnviaConsoleLogHandler = jest.spyOn(enviaConsoleLogHandler, "handle");

    const customer = new Customer("1", "João");
    customer.changeAddress(new Address("Av. Paulista", 123, "99000-000", "São Paulo"));
    const customerAddressChangedEvent = new CustomerAddressChangedEvent(customer);
    eventDispatcher.notify(customerAddressChangedEvent);

    expect(spyEnviaConsoleLogHandler).toHaveBeenCalledWith(customerAddressChangedEvent);
  });
});
