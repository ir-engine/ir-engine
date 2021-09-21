import { GameLinks } from "../../components";
import useTitleBar from "../../hooks/useTitleBar";
import Login from "./Login";
import Register from "./Register";

export const ajaxErrorMsg =
	"Error connecting to server. Check your Internet connection or try again later.";

const LoginOrRegister = () => {
	useTitleBar({
		title: "Login or Register",
	});
	return (
		<>
			<div className="row">
				<div className="col-sm-12 col-md-10 col-lg-8">
					<p>Creating an account enables two features:</p>
					<ol>
						<li>
							You can sign up for GM Gold, which removes all ads from{" "}
							<GameLinks thisGameText="this game" />.
						</li>
					</ol>
				</div>
			</div>

			<div className="row">
				<div className="col-sm-6 col-md-5 col-lg-4">
					<Login ajaxErrorMsg={ajaxErrorMsg} />
				</div>
				<div className="col-sm-6 col-md-5 col-lg-4">
					<Register ajaxErrorMsg={ajaxErrorMsg} />
				</div>
			</div>
		</>
	);
};

export default LoginOrRegister;
