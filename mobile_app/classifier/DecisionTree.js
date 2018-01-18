DecisionTree = function (predicate, action) {
    this.predicate = predicate;
    this.action = action;
};


DecisionTree.prototype = {
    nomatch : { match : false },
    match : function (v) { return { match : true, result :v }; },
    name: "Decision Tree" ,

    // Recursively test DecisionTrees and applies corresponding action on
    // `object`.
    //
    // The action applied depends on the datatype of `action`:
    //
    // - Function : evaluates to `action( object )`
    //
    // - DecisionTree : A subsequent test is performed.  Evaluates to whatever
    //          the DecisionTrees action evaluates to.
    //
    // - Array of DecisionTrees : Subsequent tests are performed.  Evaluates to whatever
    //          the action of the first matching DecisionTree evaluates to.
    //
    // - Any other Value : Evaluates to itself
    //
    // returns object containing fields:
    //
    //     match:  boolean, indicates if DecisionTree was a match
    //
    //     result:  result of action applied
    //
    evaluate : function( object ) {
        var match = this.predicate;

        if ( match instanceof Function )
            match = match( object );

        if ( match ) {

            if (this.action instanceof Function )
                return this.match( this.action(object) );

            if ( this.action instanceof DecisionTree )
                return this.action.evaluate( object );

            if ( this.action instanceof Array ) {
                var decision;
                var result;
                for (var c = 0; c < this.action.length; c++ ) {
                    decision = this.action[c];
                    if ( decision instanceof DecisionTree )  {
                        result = decision.evaluate( object );
                        if (result.match)
                            return result;
                    } else throw("Array of DecisionTree expected");
                }

                return this.nomatch;
            }

            return this.match(this.action);
        }
        return this.nomatch;
    }
};

export const decisionTree = new DecisionTree(true, Array(new DecisionTree(function(observation) {
    return (observation.alpha_sd >= 0.03471983 && observation.beta_mean >= 0.126057326179771 && observation.gamma_sd >= 0.0235203583425505 && observation.beta_sd >= 0.015061809387618 && observation.alpha_mean >= 0.076822843035105 && observation.gamma_mean < 0.0155624674457413 && true);
}, Array(new DecisionTree(function(observation) {
    return observation.alpha_mean < 2.349528
}, Array(new DecisionTree(function(observation) {
    return (observation.gamma_sd >= 0.07821505 && observation.beta_sd >= 0.104505710793936 && observation.gamma_mean >= 0.0502943123883231 && observation.alpha_sd >= 0.340041839972901 && observation.beta_mean >= 0.465872559355127 && observation.alpha_mean < -1.37468221549171 && true);
}, "gehen"), new DecisionTree(function(observation) {
    return (observation.gamma_sd < 0.07821505 && observation.beta_sd < 0.104505710793936 && observation.gamma_mean < 0.0502943123883231 && observation.alpha_sd < 0.340041839972901 && observation.beta_mean < 0.465872559355127 && observation.alpha_mean >= -1.37468221549171 && true);
}, Array(new DecisionTree(function(observation) {
    return (observation.beta_mean >= 0.3473947 && observation.beta_sd >= 0.0359416748454204 && observation.alpha_sd >= 0.0844399551719509 && true);
}, "gehen"), new DecisionTree(function(observation) {
    return (observation.beta_mean < 0.3473947 && observation.beta_sd < 0.0359416748454204 && observation.alpha_sd < 0.0844399551719509 && true);
}, "treppe"))))), new DecisionTree(function(observation) {
    return observation.alpha_mean >= 2.349528
}, "treppe"))), new DecisionTree(function(observation) {
    return (observation.alpha_sd < 0.03471983 && observation.beta_mean < 0.126057326179771 && observation.gamma_sd < 0.0235203583425505 && observation.beta_sd < 0.015061809387618 && observation.alpha_mean < 0.076822843035105 && observation.gamma_mean >= 0.0155624674457413 && true);
}, "stehen")))
