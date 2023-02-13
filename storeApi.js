let express=require("express");
let app=express();
app.use(express.json());
app.use(function(req,res,next){
  res.header("Access-Control-Allow-Origin","*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST,OPTIONS,PUT,PATCH,DELETE,HEAD"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin,X-Requested-With,Content-Type,Accept"
  );
  next();
});
let fs=require("fs");
var port=process.env.PORT||2410;
app.listen(port,()=>console.log(`Node app Listening on port ${port}`));

let {datajson}=require("./storeData.js");
let fname="store.json";
app.get("/resetData",function(req,res){
  let data=JSON.stringify(datajson);
  // console.log("reset data= ",data);
  fs.writeFile(fname,data,function(err){
    if(err) res.status(404).send(err);
    else res.send("Data in file is reset");
  });
});

app.get("/purchases",function(req,res){
  fs.readFile(fname,"utf8",function(err,data){
    if(err) res.status(404).send(err);
    else {
      let purchasesArray=JSON.parse(data);
      let shop=+req.query.shop;   
      let product=req.query.product;          
      let sort=req.query.sort;
      let productArr=[];
      // console.warn();
      // console.log("purchasesArray",purchasesArray)
      // res.send(purchasesArray.purchases);
      console.log("product",product)
      let arr1=purchasesArray.purchases;
      if(shop){
        arr1=arr1.filter(st=>st.shopId===shop);
        // console.log(arr1);
      }  
      if(product){
        productArr=product.split(",");
        console.log("product Arr=",productArr)
        arr1=arr1.filter((st)=>productArr.find(c1=>+c1===st.productid));
      }
      if(sort==="QtyAsc")
        arr1.sort((s1,s2)=>(s1.quantity)-(s2.quantity));
      if(sort==="QtyDesc")
        arr1.sort((s1,s2)=>(s2.QtyDesc)-(s1.QtyDesc));
      if(sort==="ValueAsc")
        arr1.sort((s1,s2)=>(s1.quantity*s1.price)-(s2.quantity*s2.price)); 
      if(sort==="ValueDesc")
        arr1.sort((s1,s2)=>(s2.quantity*s2.price)-(s1.quantity*s1.price));  
      res.send(arr1);
    }
  }); 
});
app.get("/products/:prodId",function(req,res){
  let id=+req.params.prodId;
  fs.readFile(fname,"utf8",function(err,datajson){
    if(err) res.status(404).send(err);
    else {
      let purchaseArray=JSON.parse(datajson);
      console.log("purchaseArray",purchaseArray);
      let prod=purchaseArray.products.find(st=>st.productId===id);
      if(prod)
        res.send(prod);
      else res.status(404).send("No product found");
    }
  });
});

app.get("/products",function(req,res){
  fs.readFile(fname,"utf8",function(err,data){
    if(err) res.status(404).send(err);
    else {
      let storeArray=JSON.parse(data);
      console.log("product get",storeArray.products);
      res.send(storeArray.products);
    }
  });
});
app.get("/purchases/products/:prodid",function(req,res){
  let prodid=+req.params.prodid;
  fs.readFile(fname,"utf8",function(err,datajson){
    if(err) res.status(404).send(err);
    else {
      let purchaseArray=JSON.parse(datajson);
      console.log("purchaseArray",purchaseArray);
      let products=purchaseArray.purchases.filter(st=>st.productid===prodid);
      console.log("purchase product",products)
      if(products)
        res.send(products);
      else res.status(404).send("No products found");
    }
  });
});

app.get("/totalPurchase/product/:id",function(req,res){
  let id=+req.params.id;
  console.log("total purchase",id)
  fs.readFile(fname,"utf8",function(err,datajson){
    if(err) res.status(404).send(err);
    else {
      let purchaseArray=JSON.parse(datajson);
      console.log("purchaseArray",purchaseArray);
      let arr=purchaseArray.purchases.filter(st=>st.productid===id);
      let result=[];
      let ids=[];
      arr.map(a=>{
        let index=ids.findIndex(id=>id===a.shopId);
        console.log("index",index,"ids=",ids)
        if(index==-1){  
        console.log("in if");      
        let st={};
        let total=arr.filter(ar=>ar.shopId===a.shopId);
        st["shopId"]=a.shopId;
        st["totalpurchase"]=total.length;
        let shops=purchaseArray.shops.find(sh=>sh.shopId===a.shopId);
        st["shopname"]=shops.name;  
        st["productId"]=id;
        let product=purchaseArray.products.find(sh=>sh.productId===id);
        console.log("product",product)
        st["productName"]=product.productName;
        result.push(st);
        ids.push(a.shopId)
      }
      }); 
      if(result)
        res.send(result);
      else res.status(404).send("No shop found");
    }
  });
});
app.post("/products",function(req,res){
  let body=req.body;
  // console.log("body=",body);
  fs.readFile(fname,"utf8",function(err,datajson){
    if(err) res.status(404).send(err);
    else {
      let productArray=JSON.parse(datajson);
      console.log("new customer", productArray.products);
      let newproduct={...body};      
      productArray.products.push(newproduct);
      console.log("productArray", productArray);
      let data1=JSON.stringify(productArray);
      // let products=data1.products;
      console.log("data1", data1);
      fs.writeFile(fname,data1,function(err){ 
        if(err) res.status(404).send(err);
        else res.send(newproduct);
      });
    }
  });
});
app.put("/products/:id",function(req,res){
  let body=req.body;
  let id=+req.params.id;
  fs.readFile(fname,"utf8",function(err,data){
    if(err) res.status(404).send(err);
    else {
      let productsArray=JSON.parse(data);
      console.log("productArray",productsArray)
      let index=productsArray.products.findIndex(st=>st.productId===id);
      if(index>=0){
        let updatedproduct={...productsArray.products[index],...body};
        console.log("updatedStudent",updatedproduct);
        productsArray.products[index]=updatedproduct;
        let data1=JSON.stringify(productsArray);
        fs.writeFile(fname,data1,function(err){
          if(err) res.status(404).send(err);
          else res.send(updatedproduct);
        });
      }
      else{
        res.status(404).send("No customer Found");
      }
    }
  });
});
app.get("/shops",function(req,res){
  fs.readFile(fname,"utf8",function(err,data){
    if(err) res.status(404).send(err);
    else {
      let storeArray=JSON.parse(data);
      res.send(storeArray.shops);
    }
  });
  
});
app.post("/shops",function(req,res){
  let body=req.body;
  console.log("body=",body);
  fs.readFile(fname,"utf8",function(err,datajson){
    if(err) res.status(404).send(err);
    else {
      let shopArray=JSON.parse(datajson);
      // console.log("new customer", customersArray);
      let newshop={...body};
      shopArray.shops.push(newshop);
      // console.log("new customer", newCustomer);
      let data1=JSON.stringify(shopArray);
      fs.writeFile(fname,data1,function(err){
        if(err) res.status(404).send(err);
        else res.send(newshop);
      });
    }
  });
});
app.get("/purchases/shops/:shopid",function(req,res){
  let id=+req.params.shopid;
  fs.readFile(fname,"utf8",function(err,datajson){
    if(err) res.status(404).send(err);
    else {
      let purchaseArray=JSON.parse(datajson);
      console.log("purchaseArray",purchaseArray);
      let shop=purchaseArray.purchases.filter(st=>st.shopId===id);
      if(shop)
        res.send(shop);
      else res.status(404).send("No shop found");
    }
  });
});
app.get("/totalPurchase/shop/:id",function(req,res){
  let id=+req.params.id;
  console.log("total purchase",id)
  fs.readFile(fname,"utf8",function(err,datajson){
    if(err) res.status(404).send(err);
    else {
      let purchaseArray=JSON.parse(datajson);
      console.log("purchaseArray",purchaseArray);
      let arr=purchaseArray.purchases.filter(st=>st.shopId===id);
      let result=[];
      let ids=[];
      arr.map(a=>{
        let index=ids.findIndex(id=>id===a.productid);
        console.log("index",index,"ids=",ids)
        if(index==-1){  
        console.log("in if");      
        let st={};
        let total=arr.filter(ar=>ar.productid===a.productid);
        st["shopId"]=a.shopId;
        st["totalpurchase"]=total.length;
        let shops=purchaseArray.shops.find(sh=>sh.shopId===id);
        st["shopname"]=shops.name;  
        st["productId"]=a.productid;
        let product=purchaseArray.products.find(sh=>sh.productId===a.productid);
        console.log("product",product)
        st["productName"]=product.productName;
        result.push(st);
        ids.push(a.productid)
      }
      }); 
      if(result)
        res.send(result);
      else res.status(404).send("No shop found");
    }
  });
});

