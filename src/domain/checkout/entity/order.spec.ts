import Order from "./order";
import OrderItem from "./order_item";

describe("Order unit tests", () => {
  it("should throw error when id is empty", () => {
    expect(() => {
      let order = new Order("", "123", []);
    }).toThrowError("Id is required");
  });

  it("should throw error when customerId is empty", () => {
    expect(() => {
      let order = new Order("123", "", []);
    }).toThrowError("CustomerId is required");
  });

  it("should throw error when customerId is empty", () => {
    expect(() => {
      let order = new Order("123", "123", []);
    }).toThrowError("Items are required");
  });

  it("should calculate total", () => {
    const item = new OrderItem("i1", "Item 1", 100, "p1", 2);
    const item2 = new OrderItem("i2", "Item 2", 200, "p2", 2);
    const order = new Order("o1", "c1", [item]);

    let total = order.total();

    expect(order.total()).toBe(200);

    const order2 = new Order("o1", "c1", [item, item2]);
    total = order2.total();
    expect(total).toBe(600);
  });

  it("should throw error if the item qte is less or equal zero 0", () => {
    expect(() => {
      const item = new OrderItem("i1", "Item 1", 100, "p1", 0);
      const order = new Order("o1", "c1", [item]);
    }).toThrowError("Quantity must be greater than 0");
  });

  it("should add an item to an order", () => {
    const itemOne = new OrderItem("i1", "Item 1", 100, "p1", 1);
    const order = new Order("o1", "c1", [itemOne]);
    const itemTwo = new OrderItem("i2", "Item 2", 200, "p2", 2);
    order.addItem(itemTwo);
    expect(order.items.length).toBe(2);
    expect(order.items.find(item => item.id === "i1")).toBeDefined();
    expect(order.items.find(item => item.id === "i2")).toBeDefined();
  });

  it("should remove an item from an order", () => {
    const itemOne = new OrderItem("i1", "Item 1", 100, "p1", 1);
    const itemTwo = new OrderItem("i2", "Item 2", 200, "p2", 2);
    const order = new Order("o1", "c1", [itemOne, itemTwo]);
    order.removeItem("i1");
    expect(order.items.length).toBe(1);
    expect(order.items.find(item => item.id === "i1")).toBeUndefined();
  });
});
