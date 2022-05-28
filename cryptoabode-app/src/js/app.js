App = {
    web3Provider: null,
    contracts: {},
    account:'0x0',
    cryptoAbodeInstance: null,
    network_id:3, // 5777 for local
    handler:null,
    value:1000000000000000000,
    gasPrice:3000000000,
    index:0,
    margin:10,
    left:15,
    
    init: function() {
        return App.initWeb3();
    },
    
    initWeb3: function() {
        console.log(window.ethereum);
        if (typeof web3 !== 'undefined') {
            App.web3Provider = web3.currentProvider
            web3 = new Web3(web3.currentProvider);
            
        } else {
            console.log("WEB 3 is undefined")

            App.web3Provider = new Web3.providers.HttpProvider('https://ropsten.infura.io/v3/cd80bb5a46b54392b1a27e21f351d32f');
            web3 = new Web3(App.web3Provider);
        }
        // web3.eth.defaultAccount = "0x42b3FF9AE86775215E68BAD3405d39079FE9C5e6";
        web3.eth.defaultAccount = web3.eth.coinbase;
        console.log("web3.eth.getAccounts()")
        console.log(web3.eth.accounts);

        
        return App.initContract();
    },
    
    initContract: function() {
        $.getJSON('CryptoAbode.json', function(realT) {
            window.ethereum.enable();
            // Get the necessary contract artifact file and instantiate it with truffle-contract
            App.contracts.CryptoAbode = TruffleContract(realT);
            // App.contracts.CryptoAbode.gasPrice = "1000000000000000000";
            // Set the provider for our contract
            App.contracts.CryptoAbode.setProvider(App.web3Provider);
            App.contracts.CryptoAbode.deployed().then(function(instance) {
                App.cryptoAbodeInstance = instance;
                // addUser (string memory name, string memory contact, string memory location)
                // return App.cryptoAbodeInstance.addUser("test", "19822", "Seattle", {gasPrice: 3000000000});
                //return App.handlePlaceBid();
                return App.start();
            }).then((balance)=> {
                console.log("balance");
                console.log(balance);
            }).catch((err)=> {
                console.log("err");
                console.log(err);
            })
            //return App.bindEvents();
        });
    },

    start : function(){
        App.bindEvents();
        App.cryptoAbodeInstance.checkIfAdmin().then(function(isAdmin){
            if(isAdmin){
                App.handleGetUsers();

            }
        });
        
        App.cryptoAbodeInstance.checkIfAuditor().then(function(isAuditor){
            if(isAuditor){
                App.handleShowEstatesToVerify();
            }
        });
        App.handleGetEstates();
    },

    addBal: function(){
        App.cryptoAbodeInstance.addContractBalance({value:web3.toWei(20, "ether")});
    },
    
    bindEvents: function() {  
        $(document).on('click', '#addUser', function(){
            App.handleAddUser();
        });
        
        $(document).on('click', '#button-user', function(){
            App.handleRegisterUser(jQuery(this).attr('addr'));
        });

        $(document).on('click', '#button-auditor', function(){
            App.handleRegisterAuditor(jQuery(this).attr('addr'));
        });

        $(document).on('click', '#getUsers', function(){
            App.handleGetUsers();
        });
        $(document).on('click', '#verifyProperty',function(){
            App.handleVerifyProperty(jQuery(this).attr('estate-id'));
        });
        $(document).on('click', '#addEstate', function(){
            App.handleAddEstate();
        });
        $(document).on('click', '#getEstateDetails',function(){
            // App.handl(); get estate to-do
        });
        $(document).on('click', '#placeBid',function(){
            App.handlePlaceBid(jQuery(this).attr('estate-id'));
        });
        $(document).on('click', '#stopBidding',function(){
            App.handleStopBid(jQuery(this).attr('estate-id'));
        });
        $(document).on('click', '#getRealTBalance',function(){
            App.handleGetBalance();
        });
    },
        
        handleAddUser:function(){
            var name = jQuery("#user-name").val();
            var contact = jQuery("#user-contact").val();
            var location = jQuery("#user-location").val();
            App.cryptoAbodeInstance.addUser(name,contact,location).then(function(){
                alert("New user added");
            });
        },
        
        handleRegisterUser: function(userAddr){
            // let userAddr = $("#user-addr").val();
            let userType = 3;
            console.log(userAddr,userType);
            App.cryptoAbodeInstance.registerUser(userAddr,userType).then(function(result, err){
                if(result){
                    if(parseInt(result.receipt.status) == 1)
                    alert(userAddr + " registration done successfully")
                    else
                    alert(userAddr + " registration not done successfully due to revert")
                } else {
                    alert(userAddr + " registration failed")
                } 
                location.reload();  
            });
        },

        handleRegisterAuditor: function(userAddr){
            // var userAddr = $("#user-addr").val();
            let userType = 2;
            console.log(userAddr,userType);
            App.cryptoAbodeInstance.registerUser(userAddr,userType).then(function(result, err){
                if(result){
                    if(parseInt(result.receipt.status) == 1)
                    alert(userAddr + " registration done successfully")
                    else
                    alert(userAddr + " registration not done successfully due to revert")
                } else {
                    alert(userAddr + " registration failed")
                } 
                location.reload();  
            });
        },

        handleAirdropToken: function(){
            let receiver_address = jQuery("#receiverAddress").val();
            let token_amount = parseInt(jQuery("#tokenAmount").val());
            App.cryptoAbodeInstance.transferRealTTokenAirDrop(receiver_address,web3.toWei(token_amount, "ether")).then(function(result, err){
            // App.cryptoAbodeInstance.transferRealTTokenAirDrop(receiver_address,token_amount).then(function(result, err){
                alert("Tokens sent!");
            });
        },

        handleGetUsers:function(){
            App.cryptoAbodeInstance.getUserAddresses().then(function(userAddrs){
                $div1 = jQuery("<table border=15></table>");
                $div1.append(jQuery("<tr><th>User ID</th><th>Name</th><th>User Type</th><th>Contact</th><th>Location</th><th colspan='2'>Action</th></tr>"))
                for(let i = 0; i < userAddrs.length; i++){
                    App.cryptoAbodeInstance.getUser(userAddrs[i]).then(function(userDetails){
                        console.log("Get User");
                        console.log(userDetails);
                        let userID = userDetails[0]['c'][0];
                        $div = jQuery("<tr></tr>");
                        
                        $idSpan = jQuery("<td>" + userID +" </td>");
                        $userTypeSpan = jQuery("<td> " + userDetails[1] +" </td>");
                        $nameSpan = jQuery("<td> " + userDetails[2] +" </td>");
                        $contactSpan = jQuery("<td> " + userDetails[3] +" </td>");
                        $locationSpan = jQuery("<td> " + userDetails[4] + " </td>");
                        console.log(userAddrs[i]);
                        $button1 = jQuery("<td><button addr='" + userAddrs[i] + "' id='button-user'>Register the person as User</button></td>");
                        $button2 = jQuery("<td><button addr='" + userAddrs[i] + "' id='button-auditor'>Register the person as Auditor</button></td>");
                        $div.append($idSpan);
                        $div.append($nameSpan);
                        $div.append($userTypeSpan);
                        $div.append($contactSpan);
                        $div.append($locationSpan);
                        $div.append($button1);
                        $div.append($button2);
                        $div1.append($div);
                    });
                }
                                        
                $("#show-users").append($div1);
                // $("#show-users").prepend("<h4>User ID - Name - User Type - Contact - Location</h4>");
                $("#show-users").prepend("<h2>Approve user registration (Only for Admin)</h2>");
                
                
        });
    },

        handleAddEstate:function(){
            console.log("Adding estate");
            var location = $("#estate-location").val();
            var cost = $("#estate-cost").val();
            var imageURL = $("#estate-img").val();
            var feature = $("#estate-feat").val();
            // App.cryptoAbodeInstance.addEstate(location,web3.toWei(cost, "ether"),imageURL,feature).then(function(){
            App.cryptoAbodeInstance.addEstate(location,cost,imageURL,feature).then(function(){
                console.log("Estate Added")
                alert("New estate added");
                
            });
        },
        
        handleVerifyProperty:function(estateIndex){
            // var estateIndex = $("#estate-id").val();
            App.cryptoAbodeInstance.verifyProperty(estateIndex).then(function(){
                alert("Estate with id " + estateIndex + " verified successfully");
            });
        },

        handleShowEstatesToVerify: function(){
            App.cryptoAbodeInstance.getEstateCount().then(function(estateCount){
                // const container = document.getElementById('div');
                $div1 = jQuery("<table border=15></table>");
                $div1.append(jQuery("<tr><th>Location</th><th>Estimated Minimum Price</th><th>Feature</th><th>Owner Account</th><th>Action</th></tr>"))
                for(let i = 1; i <= estateCount['c'][0]; i++){
                    App.cryptoAbodeInstance.getEstateDetails(i).then(function(estateDetails){
                        console.log("Get Estate");
                        console.log(estateDetails);
                        // let price = web3.fromWei(estateDetails[1]['c'][0],'ether');
                        // let estateID = userDetails[0]['c'][0];
                        let price = estateDetails[1]['c'][0];
                        $div = jQuery("<tr></tr>");
                        
                        $estateAddrSpan = jQuery("<td> " + estateDetails[0] +" </td>");
                        $priceSpan = jQuery("<td> " + price +" </td>");
                        $featSpan = jQuery("<td> " + estateDetails[3] +" </td>");
                        $ownerSpan = jQuery("<td> " + estateDetails[5] +" </td>");
                        $button1 = jQuery("<td><button estate-id='" + i + "' id='verifyProperty'>Verify Property</button></td>");
                       

                        $div.append($estateAddrSpan);
                        $div.append($priceSpan);
                        $div.append($featSpan);
                        $div.append($ownerSpan);
                        $div.append($button1);
                        $div1.append($div);
                        
                    });
                }
                $("#show-estates").append($div1);
                $("#show-estates").prepend("<h2>Verify property (Only for Auditor)</h2>");
        });
    },
        
        handlePlaceBid:function(estateIndex){
            // var estateIndex = $("#estate-id").val();
            var bidValue = $(`#estate-bid-val-${estateIndex}`).val();
           console.log(estateIndex,bidValue);
            
            
            // App.cryptoAbodeInstance.placeBid(estateIndex,bidValue, { value: web3.toWei(bidValue, "ether") }).then(function (result, err) {
            // App.cryptoAbodeInstance.placeBid(estateIndex,web3.toWei(bidValue, "ether"),{value:web3.toWei(bidValue, "ether")}).then(function (result, err) {   
            App.cryptoAbodeInstance.placeBid(estateIndex, web3.toWei(bidValue, "ether"), {gas: 3000000}).then(function (result, err) { 

            if (result) {
                    console.log(result.receipt.status);
                    if (parseInt(result.receipt.status) == 1){
                        alert("Your Bid is Placed!", "", { "iconClass": 'toast-info notification0' });
                    }else{
                        alert("Error in Bidding. Bidding Reverted!");
                    }
                } else {
                    alert("Bidding Failed!");
                }
            }).catch(function (err) {
                console.log(err);
                alert("Bidding Failed!");
            });
            
        },
        
        handleStopBid:function(estateIndex){
            // var estateIndex = $("#estate-id").val();
            App.cryptoAbodeInstance.stopBidding(estateIndex).then(function(){
                alert("Bidding stopped for estate with id " + estateIndex);
            });
            
        },

        handleGetEstates: function(){
            App.cryptoAbodeInstance.getEstateCount().then(function(estateCount){
                // const container = document.getElementById('div');
                for(let i = 1; i <= estateCount['c'][0]; i++){
                    App.cryptoAbodeInstance.getEstateDetails(i).then(function(estateDetails){
                        console.log("Get Estate");
                        console.log(estateDetails);
                        // let price = web3.fromWei(estateDetails[1]['c'][0],'ether');
                        let price = estateDetails[1]['c'][0];
                        if(estateDetails[4] && estateDetails[5]){
                            $div = jQuery("<div class='card'></div>");
                            $img = jQuery("<img src = " + estateDetails[2] +" alt='Estate "+i+"'/>");
                            $price = jQuery("<h3 class = 'price' >" + price +" RealT Tokens</h3>");
                            $feat = jQuery("<h3>" + estateDetails[3] +"</h3>");
                            $estateAddr = jQuery("<h3>" + estateDetails[0] +"</h3>");
                            $input = jQuery(`<input type='text' placeholder='Enter the bid amount' id='estate-bid-val-${i}' required></input>`);
                            $button1 = jQuery("<button type = 'submit' estate-id="+i+" id='placeBid'>Place Bid</button>");
                            $button2 = jQuery("<button estate-id= "+i+" id= 'stopBidding'>Stop Bid</button>");
                        }
                        else{
                            $div = jQuery("<div></div>");
                        }

                        $div.append($img);
                        $div.append($price);
                        $div.append($feat);
                        $div.append($estateAddr);
                        $div.append($input);
                        $div.append($button1);
                        $div.append($button2);
                        
                        $("#displayEstates").append($div);
                    });
                    
                }
            });
        },   

        handleGetBalance: function(){
            console.log("Inside get balance");
            
            App.cryptoAbodeInstance.getRealTBalance().then(function(balance,err){
                if(balance){
                    console.log(balance);
                    $div = jQuery("<div><h1></h1></div>");
                    $balanceSpan = jQuery("<span><h3> You own " + balance["c"][0]*0.0001 +" RealT tokens </h3></span>");
                    $div.append($balanceSpan);
                    // alert("Token balance enquiry done; Balance is "+ balance["c"][0]*0.0001 +" tokens");
                } else {
                    alert("Token balance enquiry failed");
                }
                $(".user-token-balance").append($div);
            });

            
        }
    }
    
    $(function(){
        $(window).load(function(){
            App.init();
        });
    });