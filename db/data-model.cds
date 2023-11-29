namespace northwind;


using {
    cuid,
    managed
} from '@sap/cds/common';

entity Files: cuid, managed{
    @Core.MediaType: mediaType
    content: LargeBinary;
    @Core.IsMediaType: true
    mediaType: String;
    fileName: String;
    size: Integer;
    url: String;
}

entity Order_Detail {
  OrderID   : Integer;
  key ProductID  : Integer;
  UnitPrice  : Decimal;
  Quantity   : Integer;
  Discount   : Integer;
}

