import EventHandlerInterface from "../../../@shared/event/event-handler.interface";
import CustomerAddressChangedEvent from "../customer-address-changed-event";
import CustomerCreatedEvent from "../customer-created-event";

export default class EnviaConsoleLogHandler implements EventHandlerInterface<CustomerAddressChangedEvent>{
  handle(event: CustomerAddressChangedEvent): void {
    const customer = event.eventData;
    console.log(`Endereço do cliente: ${customer.id}, ${customer.name} alterado para: ${customer.Address}`);
  }
}
