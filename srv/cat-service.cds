using northwind as my from '../db/data-model';

service CatalogService {
    entity Order_Details as projection on my.Order_Detail;
     entity Files as projection on my.Files;

}