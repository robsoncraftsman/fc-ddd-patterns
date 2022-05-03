import { Sequelize } from "sequelize-typescript";
import Order from "../../../../domain/checkout/entity/order";
import OrderItem from "../../../../domain/checkout/entity/order_item";
import Customer from "../../../../domain/customer/entity/customer";
import Address from "../../../../domain/customer/value-object/address";
import Product from "../../../../domain/product/entity/product";
import CustomerModel from "../../../customer/repository/sequelize/customer.model";
import CustomerRepository from "../../../customer/repository/sequelize/customer.repository";
import ProductModel from "../../../product/repository/sequelize/product.model";
import ProductRepository from "../../../product/repository/sequelize/product.repository";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";
import OrderRepository from "./order.repository";

describe("Order repository test", () => {
  let sequelize: Sequelize;

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
      sync: { force: true },
    });

    await sequelize.addModels([
      CustomerModel,
      OrderModel,
      OrderItemModel,
      ProductModel,
    ]);
    await sequelize.sync();
  });

  afterEach(async () => {
    await sequelize.close();
  });

  it("should create a new order", async () => {
    const customerRepository = new CustomerRepository();
    const customer = new Customer("123", "Customer 1");
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.changeAddress(address);
    await customerRepository.create(customer);

    const productRepository = new ProductRepository();
    const product = new Product("123", "Product 1", 10);
    await productRepository.create(product);

    const ordemItem = new OrderItem(
      "1",
      product.name,
      product.price,
      product.id,
      2
    );

    const order = new Order("123", "123", [ordemItem]);

    const orderRepository = new OrderRepository();
    await orderRepository.create(order);

    const orderModel = await OrderModel.findOne({
      where: { id: order.id },
      include: ["items"],
    });

    expect(orderModel.toJSON()).toStrictEqual({
      id: "123",
      customer_id: "123",
      total: order.total(),
      items: [
        {
          id: ordemItem.id,
          name: ordemItem.name,
          price: ordemItem.price,
          quantity: ordemItem.quantity,
          order_id: "123",
          product_id: "123",
        },
      ],
    });
  });

  it("should update an order", async () => {
    const customerRepository = new CustomerRepository();
    const customer = new Customer("1", "Customer 1");
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.changeAddress(address);
    await customerRepository.create(customer);

    const productRepository = new ProductRepository();
    const productOne = new Product("1", "Product 1", 10);
    await productRepository.create(productOne);

    const ordemItemOne = new OrderItem(
      "1",
      productOne.name,
      productOne.price,
      productOne.id,
      2
    );

    const orderId = "1";
    const customerId = "1";
    const orderToInsert = new Order(orderId, customerId, [ordemItemOne]);

    const orderRepository = new OrderRepository();
    await orderRepository.create(orderToInsert);

    const insertedOrderModel = await OrderModel.findOne({
      where: { id: orderToInsert.id },
      include: ["items"],
    });

    expect(insertedOrderModel.toJSON()).toStrictEqual({
      id: orderId,
      customer_id: customerId,
      total: orderToInsert.total(),
      items: [
        {
          id: ordemItemOne.id,
          name: ordemItemOne.name,
          price: ordemItemOne.price,
          quantity: ordemItemOne.quantity,
          order_id: orderId,
          product_id: productOne.id,
        },
      ],
    });

    const productTwo = new Product("2", "Product 2", 20);
    await productRepository.create(productTwo);
    const ordemItemTwo = new OrderItem(
      "2",
      productTwo.name,
      productTwo.price,
      productTwo.id,
      2
    );

    const productThree = new Product("3", "Product 3", 30);
    await productRepository.create(productThree);
    const ordemItemThree = new OrderItem(
      "3",
      productThree.name,
      productThree.price,
      productThree.id,
      2
    );

    const orderToUpdate = new Order(orderId, customerId, [ordemItemTwo, ordemItemThree]);
    await orderRepository.update(orderToUpdate);

    const updatedOrderModel = await OrderModel.findOne({
      where: { id: orderToUpdate.id },
      include: ["items"],
    });

    const jsonUpdatedOrderModel = updatedOrderModel.toJSON();
    expect(jsonUpdatedOrderModel).toStrictEqual({
      id: orderId,
      customer_id: customerId,
      total: orderToUpdate.total(),
      items: [
        {
          id: ordemItemTwo.id,
          name: ordemItemTwo.name,
          price: ordemItemTwo.price,
          quantity: ordemItemTwo.quantity,
          order_id: orderId,
          product_id: productTwo.id,
        },
        {
          id: ordemItemThree.id,
          name: ordemItemThree.name,
          price: ordemItemThree.price,
          quantity: ordemItemThree.quantity,
          order_id: orderId,
          product_id: productThree.id,
        },
      ],
    });

  });

  it("find an order by id", async () => {
    const customerRepository = new CustomerRepository();
    const customer = new Customer("1", "Customer 1");
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.changeAddress(address);
    await customerRepository.create(customer);
    
    const productRepository = new ProductRepository();
    const orderRepository = new OrderRepository();

    const productOne = new Product("1", "Product 1", 10);
    await productRepository.create(productOne);
    const newOrdemItemOne = new OrderItem(
      "1",
      productOne.name,
      productOne.price,
      productOne.id,
      2
    );

    const productTwo = new Product("2", "Product 2", 20);
    await productRepository.create(productTwo);
    const newOrdemItemTwo = new OrderItem(
      "2",
      productTwo.name,
      productTwo.price,
      productTwo.id,
      2
    );

    const newOrder = new Order("1", customer.id, [newOrdemItemOne, newOrdemItemTwo]);
    await orderRepository.create(newOrder);

    const orderFound = await orderRepository.find(newOrder.id);
    expect(orderFound).toBeTruthy();
    expect(orderFound.id).toBe(newOrder.id);
    expect(orderFound.customerId).toBe(newOrder.customerId);
    expect(orderFound.total()).toBe(newOrder.total());
    expect(orderFound.items.length).toBe(2);

    const orderFoundItemOne = orderFound.items.find(item => item.id == "1");
    expect(orderFoundItemOne.id).toBe(newOrdemItemOne.id);
    expect(orderFoundItemOne.name).toBe(newOrdemItemOne.name);
    expect(orderFoundItemOne.price).toBe(newOrdemItemOne.price);
    expect(orderFoundItemOne.quantity).toBe(newOrdemItemOne.quantity);
    expect(orderFoundItemOne.productId).toBe(newOrdemItemOne.productId);

    const orderFoundItemTwo = orderFound.items.find(item => item.id == "2");
    expect(orderFoundItemTwo.id).toBe(newOrdemItemTwo.id);
    expect(orderFoundItemTwo.name).toBe(newOrdemItemTwo.name);
    expect(orderFoundItemTwo.price).toBe(newOrdemItemTwo.price);
    expect(orderFoundItemTwo.quantity).toBe(newOrdemItemTwo.quantity);
    expect(orderFoundItemTwo.productId).toBe(newOrdemItemTwo.productId);
  });

  it("find all orders", async () => {
    const customerRepository = new CustomerRepository();
    const customer = new Customer("1", "Customer 1");
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.changeAddress(address);
    await customerRepository.create(customer);

    const productRepository = new ProductRepository();
    const orderRepository = new OrderRepository();

    const productOne = new Product("1", "Product 1", 10);
    await productRepository.create(productOne);
    const newOrdemOneItem = new OrderItem(
      "1",
      productOne.name,
      productOne.price,
      productOne.id,
      2
    );
    const newOrderOne = new Order("1", customer.id, [newOrdemOneItem]);
    await orderRepository.create(newOrderOne);

    const productTwo = new Product("2", "Product 2", 20);
    await productRepository.create(productTwo);
    const newOrdemTwoItem = new OrderItem(
      "2",
      productTwo.name,
      productTwo.price,
      productTwo.id,
      2
    );
    const newOrderTwo = new Order("2", customer.id, [newOrdemTwoItem]);
    await orderRepository.create(newOrderTwo);

    const ordersFound = await orderRepository.findAll();
    expect(ordersFound.length).toBe(2);

    const orderOneFound = ordersFound.find(order => order.id === "1");
    expect(orderOneFound.id).toBe(newOrderOne.id);
    expect(orderOneFound.customerId).toBe(newOrderOne.customerId);
    expect(orderOneFound.total()).toBe(newOrderOne.total());
    expect(orderOneFound.items.length).toBe(1);
    expect(orderOneFound.items[0].id).toBe(newOrdemOneItem.id);
    expect(orderOneFound.items[0].name).toBe(newOrdemOneItem.name);
    expect(orderOneFound.items[0].price).toBe(newOrdemOneItem.price);
    expect(orderOneFound.items[0].quantity).toBe(newOrdemOneItem.quantity);
    expect(orderOneFound.items[0].productId).toBe(newOrdemOneItem.productId);

    const orderTwoFound = ordersFound.find(order => order.id === "2");
    expect(orderTwoFound.id).toBe(newOrderTwo.id);
    expect(orderTwoFound.customerId).toBe(newOrderTwo.customerId);
    expect(orderTwoFound.total()).toBe(newOrderTwo.total());
    expect(orderTwoFound.items.length).toBe(1);
    expect(orderTwoFound.items[0].id).toBe(newOrdemTwoItem.id);
    expect(orderTwoFound.items[0].name).toBe(newOrdemTwoItem.name);
    expect(orderTwoFound.items[0].price).toBe(newOrdemTwoItem.price);
    expect(orderTwoFound.items[0].quantity).toBe(newOrdemTwoItem.quantity);
    expect(orderTwoFound.items[0].productId).toBe(newOrdemTwoItem.productId);
  });

});
