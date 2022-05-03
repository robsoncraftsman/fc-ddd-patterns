import Order from "../../../../domain/checkout/entity/order";
import OrderRepositoryInterface from "../../../../domain/checkout/repository/order-repository.interface";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";

export default class OrderRepository implements OrderRepositoryInterface {

  async create(entity: Order): Promise<void> {
    await OrderModel.create(
      {
        id: entity.id,
        customer_id: entity.customerId,
        total: entity.total(),
        items: entity.items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          product_id: item.productId,
          quantity: item.quantity,
        })),
      },
      {
        include: [{ model: OrderItemModel }],
      }
    );
  }

  async update(entity: Order): Promise<void> {
    const orderModel = await OrderModel.findOne({
      where: {id: entity.id},
      include: [{ model: OrderItemModel }]
    })

    for await (const itemModel of orderModel.items) {
      itemModel.destroy();
    }

    await OrderModel.update(
      {
        customer_id: entity.customerId,
        total: entity.total()
      },
      {
        where: {id: entity.id}
      }
    );

    for await (const item of entity.items) {
      OrderItemModel.create(      
        {
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          order_id: entity.id,
          product_id: item.productId,
        }
      );
    }
  }
  
  async find(id: string): Promise<Order> {
    throw new Error("Method not implemented.");
  }
  
  findAll(): Promise<Order[]> {
    throw new Error("Method not implemented.");
  }

}
