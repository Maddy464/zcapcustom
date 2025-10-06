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
    to_attachments : Association to  many Files on to_attachments.to_parent = $self;
    to_comments : Association to  many OrderComments on to_comments.to_parent = $self;
    comments : Association to many Comments on comments.Orders = $self;
}

entity OrderItems : cuid, managed {
    itemNumber: Integer @title: 'Item No';
    product: String @title: 'Product';
    quantity: Integer @title: 'Quantity';
    price: Integer @title: 'Price';
    amount: Integer @title: 'Amount';
    to_parent: Association to Orders;
}

entity Files: cuid, managed{

    @Core.MediaType: mediaType 
    @Core.ContentDisposition.Filename: fileName 
    @Core.ContentDisposition.Type: 'inline'
    content: LargeBinary;
    @Core.IsMediaType: true
    mediaType: String;
    fileName: String;
    size: Integer;
    url: String;
    to_parent: Association to Orders;
}

entity Comments {
  key ID : Integer;
  Orders : Association to Orders;
  text : String;
  user : String;
  createdAt : Timestamp;
}

entity OrderComments: cuid,managed{
    
    text : String;
    author : String;
    timestamp : String; // or use a proper date/time type
    to_parent : Association to Orders; // Link to the parent product entity
}

entity Statuses : sap.common.CodeList  {
    key ID : Integer
}