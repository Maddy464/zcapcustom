using { cap.sales as db } from '../db/sales-model';

service CatalogService @(path:'/CatalogService')
    {
    entity SalesOrder as projection on db.SalesOrders
    }