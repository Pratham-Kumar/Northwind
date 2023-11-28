namespace northwind;

entity Order_Detail {
  OrderID : Integer;
  key ProductID  : Integer;
  UnitPrice  : Decimal;
  Quantity: Integer;
  Discount: Integer;
}

// entity Attachment {


// }
