import { BrowserRouter, Switch, Route } from "react-router-dom";
import { StateProvider } from "./stateService";
import {ViewportProvider} from "./viewportService";
import {DialogProvider} from "./services/dialogService";
import Administration from "./pages/administration";
import Index from "./pages";
import Login from "./pages/login";
import ForgotPassword from "./pages/forgot-password";
import ResetPassword from "./pages/reset-password";
import Client from "./pages/client";
import {MuiPickersUtilsProvider} from "@material-ui/pickers";
import MomentUtils from "@date-io/moment";

export default function App()
{
    return (
        <MuiPickersUtilsProvider utils={ MomentUtils }>
            <StateProvider>
                <ViewportProvider>
                    <DialogProvider>
                        <BrowserRouter>
                            <Switch>
                                <Route path="/login" children={<Login/>}/>
                                <Route path="/forgot-password" children={<ForgotPassword/>}/>
                                <Route path="/reset-password/:token" children={<ResetPassword/>}/>
                                <Route path="/administration" children={<Administration/>}/>
                                <Route path="/client" children={<Client/>}/>
                                <Route path="/" children={<Index/>}/>
                            </Switch>
                        </BrowserRouter>
                    </DialogProvider>
                </ViewportProvider>
            </StateProvider>
        </MuiPickersUtilsProvider>
    );
}