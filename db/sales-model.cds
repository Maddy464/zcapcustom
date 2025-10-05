namespace cap.sales;
using { cuid, managed, sap } from '@sap/cds/common';

entity SalesOrders {
    @title : 'Sales Order Number'
  key soNumber: String;
  @title : 'Order Date'
  orderDate: Date;
  @title : 'Customer Name'
  customerName: String;
  @title : 'Customer Number'
  customerNumber: String;
  @title : 'PO Number'
  PoNumber: String;
  @title : 'Inquiry Number'
  inquiryNumber: String;
  @title : 'Total Sales Order'
  totalOrderItems: Integer; 
}

entity Orders : cuid, managed {
    orderId: Integer @title : 'ID';
    date: Date @title : 'Date';
    time: Time @title : 'Time';
    comment: String @title : 'Comment';
    totalAmount: Integer @title : 'Total Amount';
    to_status: Association to Statuses @title : 'Status';
    to_items: Composition of many OrderItems on to_items.to_parent = $self;
}

entity OrderItems : cuid, managed {
    itemNumber: Integer @title: 'Item No';
    product: String @title: 'Product';
    quantity: Integer @title: 'Quantity';
    price: Integer @title: 'Price';
    amount: Integer @title: 'Amount';
    to_parent: Association to Orders;
}

entity Statuses : sap.common.CodeList  {
    key ID : Integer
}