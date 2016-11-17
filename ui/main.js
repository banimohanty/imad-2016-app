
$(document).ready(function () {	
	//Login form
	var login_form = `<h3 class="login_pg">Login Page</h3>
                    <br>
                    Username<input type="text" id="Username"><br>
                    Password<input type="password" id="Password"><br>
                    <input type="submit" id="submit_btn" value="Sign in"></input>`;


      //Sign Up Form
     var signup_form = `<h3 class="signup_pg">Sign Up Page</h3>
                    <br>
                    Username<input type="text" id="New_Username"><br>
                    Password<input type="password" id="New_Password"><br>
                    <input type="submit" id="sup_submit_btn" value="Sign Up"></input>`;
	
	// For Fetching artilces from database dynamically

	var preq = new XMLHttpRequest();

	//catch the response and store it 
	preq.onreadystatechange = function(){
		if(preq.readyState === XMLHttpRequest.DONE){
			//Take action
				if (preq.status === 200) {
					console.log("getting response from db endpoint")
				var blog_con = preq.responseText;
				var con = document.getElementById('posts');
				//$("#").html(blog_con);
				con.innerHTML = blog_con;
			}
		}
			//Not done
	};

	//Making a Request
	preq.open('GET','http://localhost:8080/fetch_blog_posts',true);
	preq.send(null);

	//------------------------------------------------		

	
	//For Login page 
	var but = $('#submit_btn');
	but.click(function(){
	var username = document.getElementById('Username').value;
	var password = document.getElementById('Password').value;;
	console.log(username);
	console.log(password);
	//Create a new response object
	var req = new XMLHttpRequest();

	//Catch the response and store it in a variable
		req.onreadystatechange = function(){
			if(req.readyState === XMLHttpRequest.DONE){
				//Take action
					if (req.status === 200) {
					//
					console.log('user logged in!');
					alert('Success!');
				}
				else if(req.status == 403){
					alert('Username/password is incorrect');
				}
				else if(req.status == 500){
					alert('something went wrong on serever');	
				}
			}
				//Not done
		};

			//Making a Request
			
			
			req.open('POST','http://localhost:8080/login',true);
			req.setRequestHeader('Content-Type', 'application/json');
			req.send(JSON.stringify({username: username, password: password}));
		});

	//-------------------------------------------------------


	$('#login').click(function(){
		var cont = document.getElementById('log_reg');
		//$('#log_reg').append(login_form);
		cont.innerHTML = login_form;
		$('#Username').focus();
		console.log('added the login form');
	});	

	$('#sign_up').click(function(){
		var cont = document.getElementById('log_reg');
		//$('#log_reg').append(signup_form);
		cont.innerHTML = signup_form;
		$('#New_Username').focus();
	});
});


