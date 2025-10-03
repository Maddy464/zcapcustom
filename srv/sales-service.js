const cds = require('@sap/cds');
const { log } = require("console");
 const { ConnectBackend } = require("./lib/ConnectionHandler");


class CatalogService extends cds.ApplicationService {

    init() {
        const { SalesOrder } = this.entities;

        // Add discount for overstocked books
        this.after('READ', SalesOrder, this.grantDiscount);

        this.before('UPDATE', SalesOrder, this.Update);


        // Reduce the stock of the ordered book according to the ordered quantity
        this.on('submitOrder', this.reduceStock);

        this.on('setDiscount', this.reduceDiscount);


        return super.init();
    }


    async Update(req) {

        log(" SalesOrderSrv Intiated - update");

         const query = SELECT.from("cap_sales_salesorders").where({
              SONUMBER: req.data.SONUMBER,
            });
            let results1 = await cds.run(query);

            
        log(" SalesOrderSrv Intiated - update results" + results1);
        

          
            if (results1.length === 0) {
              return null;
            }


    }


    grantDiscount(req) {

        log(" SalesOrderSrv Intiated --In grantDiscount");

        // for (let b of results) {
        //     if (b.stock > 200) { b.title += ' -- 11% Discount!'; }
        // }

    }


    reduceStock(req) {

     // const { percentage, reason } = req.data;

         log(" SalesOrderSrv Intiated --- reduceStock"+"percentage--" +req.data.PoNumber);
        /* !!! This is only a preliminary, incomplete implementation of the submitOrder action. !!!
           !!! In the next lesson, we will learn how to use queries.                            !!!
           !!! These will then be used to complete the implementation.                          !!! */
       // const { Books } = this.entities;
      //  const { book, quantity } = req.data;

        let quantity = 0;

        if (quantity < 1) {
            return req.warn('The quantity must be at least 1.');
        }

        let stock = 10;

        return { stock };
    }


     reduceDiscount(req) {

      const { percentage, reason } = req.data;

         log(" SalesOrderSrv Intiated --- reduceDiscount"+"percentage--"+percentage+"reason--"+reason);
        /* !!! This is only a preliminary, incomplete implementation of the submitOrder action. !!!
           !!! In the next lesson, we will learn how to use queries.                            !!!
           !!! These will then be used to complete the implementation.                          !!! */
        const { Books } = this.entities;
      //  const { book, quantity } = req.data;

        let quantity = 0;

        if (quantity < 1) {
            return req.warn('The quantity must be at least 1.');
        }

        let stock = 10;

        return { stock };
    }

}

module.exports = CatalogService;

class SaalesService extends cds.ApplicationService {

   async init() {



    //          // Incorrect:
    // this.on('READ', 'Products', myHandlerVariable); // if myHandlerVariable is not a function

    // // Correct:
    // this.on('READ', 'Products', async (req) => {
    //     // ... handler logic
    // });

        const { SalesOrder_ext } = this.entities;
        //this.on('READ', SalesOrder_ext, ConnectBackend);

         this.on('READ', 'SalesOrder_ext', async (req) => {

             const externalService = await cds.connect.to('GWSAMPLE');
              const tx = externalService.tx(req.query); // Create a transaction
              return tx.run(req.query); //
        
    });





       // const sales_gw = await cds.connect.to('GWSAMPLE');
      //  const { Products } = this.entities;
	//const service = await cds.connect.to('NorthWind');
     return super.init();

    }

}
module.exports = SaalesService;



