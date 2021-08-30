
function prefixNamespace(model) {
    if (model.reducers) {
        model.reducers = prefix(model.reducers, model.namespace)
    }
    if (model.effects) {
        model.effects = prefix(model.effects, model.namespace)
    }
    return model
}

function prefix(reducers,namespace) {
    return Object.keys(reducers).reduce((memo,key) => {
        const newKey = `${namespace}/${key}`
        memo[newKey] = reducers[key]
        return memo
    },{})        
}
  
export default prefixNamespace