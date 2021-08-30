
import React from "react";
import ReactDOM from "react-dom";
import { Provider, connect } from "react-redux";
import { createStore, combineReducers, applyMiddleware } from "redux";
import  prefixNamespace  from "./prefixNamespace";
import * as sagaEffects from "redux-saga/effects";
import createSagaMiddleware from "redux-saga";
import { createBrowserHistory } from "history";
import { ConnectedRouter, routerMiddleware, connectRouter } from "connected-react-router";
export {connect,ConnectedRouter}
let history = createBrowserHistory()
function dva() {
    const app = {
        _models:[],
        model,
        _router:null,
        router,
        start,
        effects:{}
    }
    const initialReducers = {router:connectRouter(history)}
    function model(model) {
        let prefixedModel = prefixNamespace(model)
        app._models.push(prefixedModel)
    }

    function router(router) {
        app._router =  router       
    }

    function start(root) {

        for(const model of app._models){
            initialReducers[model.namespace] = getReducer(model)
        }

        let rootReducer = createReducer()
        let sagas = getSagas(app)
        let sagaMiddleware = createSagaMiddleware()
        // let store = createStore(rootReducer)
        let store = applyMiddleware(sagaMiddleware,routerMiddleware(history))(createStore)(rootReducer)
        // sagaMiddleware.run()
        sagas.forEach(saga =>sagaMiddleware.run(saga)) 
        ReactDOM.render(
            <Provider store={store}>
                {app._router({history})}
            </Provider>,
            document.querySelector(root)
        )
    }
    function createReducer() {
        return combineReducers(initialReducers)
    }
    function getSagas(app) {
        let sagas = []
        for (const model of app._models) {
            sagas.push(getSaga(model.effects,model))
        }
        return sagas
    }
    return app
}
function getSaga(effects,model) {
    return function*() {
        for (const key in effects) {
            const watcherSaga = getWatcherSaga(key,model.effects[key],model)
            yield sagaEffects.fork(watcherSaga)
        }
    }
}
function getWatcherSaga(key, effect, model) {
    return function* () {
        yield sagaEffects.takeEvery(key, function *(...args) {
            yield effect(...args,{...sagaEffects,put:(action)=>{
               return   sagaEffects.put({...action,type:prefixType(action.type,model.namespace)})
            }})
        })
    }
}

function getReducer(model) {
    let {state:initialState,reducers} = model
    let reducer = (state=initialState,action) => {
        let reducer = reducers[action.type]
        if (reducer) return reducer(state)
        return state
    }
    return reducer
}

function prefixType(type,namespace) {
    if (type.includes('/')) return  type
    return `${namespace}/${type}`
}



export default dva