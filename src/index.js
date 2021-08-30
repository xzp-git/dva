import React from "react";
import dva, { connect, ConnectedRouter } from "./dva";
import { Route, Link, routerRedux } from "./dva/router";
// const { ConnectedRouter } = routerRedux
// dva是一个函数，执行它可以得到app实例
const app = dva()

// 调用model方法定义一个模型
app.model({
    namespace:'counter',
    state:{number:0},
    reducers:{
        add(state){
            return{number:state.number+1}
        }
    },
    effects:{
        //action动作 effects = redux/effects 
        *asyncAdd(action, {call,put,select}){
            yield call(delay,1000)
            yield put({type:'add'})
            let state = yield select(state => state.counter)
            console.log('state',state);
        },
        // *add(action,{call, put, select}){
        //     console.log('*add');
        // }
        *goto({payload},{put}){
            yield put(routerRedux.push(payload))
        }
    }
})

function Counter(props){
    return(
        <div>
            <p>{props.number}</p>
            <button onClick={() => props.dispatch({type:'counter/add'})}>++</button>
            <button onClick={() => props.dispatch({type:'counter/asyncAdd'})}>++</button>
            <button onClick={() => props.dispatch({type:'counter/goto',  payload:'/</div>'})}>跳Home</button>
        </div>
    )
}


const ConnectedCounter = connect(state =>state.counter)(Counter)

// app.model({
//     namespace:'countera',
//     state:{number:0},
//     reducers:{
//         add(state){
//             return{number:state.number+1}
//         }
//     }
// })

// function Countera(props){
//     return(
//         <div>
//             <p>{props.number}</p>
//             <button onClick={() => props.dispatch({type:'countera/add'})}>++</button>
//         </div>
//     )
// }


// const ConnectedCountera = connect(state =>state.countera)(Countera)
const Home = () => <div>Home</div>
//定义路由
app.router((api) =>(
    <ConnectedRouter history={api.history}>
        <div>
        <Link to='/'>Home</Link>
        <Link to='/counter'>Counter</Link>
        <Route path="/" exact={true} component={Home}></Route>
        <Route path="/counter"  component={ConnectedCounter}></Route>
        </div>
    </ConnectedRouter>
) )
// app.router(() => <div><ConnectedCounter /> <ConnectedCountera /></div>)
// ReactDOM.render(ConnectedCounter,document.getElementById('root'))

app.start('#root')


function delay(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve,ms)
    })
}