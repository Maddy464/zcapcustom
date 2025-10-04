using { cap.sales as db } from '../db/sales-model';
using {GWSAMPLE as external} from './external/GWSAMPLE';

service CatalogService @(path:'/CatalogService')
    {
    entity SalesOrder as projection on db.SalesOrders;


    action submitOrder() returns {
      message: String;
      promoted: Boolean;
    };

     action setDiscount(percentage: Integer, reason: String) returns {
      message: String;
      newPrice: Decimal;
    };
    
    }

    service SalesService @(path:'/SalesService')
    {
    
    @cds.persistence.table
    entity SalesOrder_ext as select from external.SalesOrderSet ;

     @cds.persistence.table
    entity SalesOrderLineItem_ext as select from external.SalesOrderLineItemSet;

     @cds.persistence.table
    entity Product_ext as select from external.ProductSet;

    
}



extend projection SalesService.SalesOrder_ext with {
    ToLineItems : Association to many SalesService.SalesOrderLineItem_ext
                            on ToLineItems.SalesOrderID = SalesOrderID

    

}

extend projection SalesService.SalesOrderLineItem_ext with {
    ToProduct : Association to one SalesService.Product_ext
                                  on ToProduct.ProductID = ProductID
                  

    

}




 
    

    