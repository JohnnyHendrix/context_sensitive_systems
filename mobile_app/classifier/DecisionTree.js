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

export const decisionTree =
new DecisionTree(true, Array(new DecisionTree(function(observation) {
return (observation.beta >= 0.1019632 && observation.gamma < 0.0140342558017029 && observation.y >= 0.0429268673146821 && observation.z >= 0.0479489337021759 && observation.alpha >= -0.0031571755751286 && true);
}, Array(new DecisionTree(function(observation) {
return (observation.alpha < -0.96701 && observation.gamma < -0.206645648375441 && observation.beta >= 0.633669000653093 && observation.x < -5.34537421232628 && observation.y >= 5.44321362949853 && true);
}, "gehen"), new DecisionTree(function(observation) {
return (observation.alpha >= -0.96701 && observation.gamma >= -0.206645648375441 && observation.beta < 0.633669000653093 && observation.x >= -5.34537421232628 && observation.y < 5.44321362949853 && true);
}, Array(new DecisionTree(function(observation) {
return (observation.beta >= 0.3546908 && observation.alpha >= -0.490116573516079 && observation.z >= -2.13621659535312 && observation.y >= -0.161441155983855 && observation.x < 1.42103543220668 && observation.gamma >= -0.168692149692251 && true);
}, Array(new DecisionTree(function(observation) {
return (observation.alpha < 2.246275 && observation.gamma < 0.239360184495145 && observation.y < 3.05677522368127 && observation.z < 3.57281176143735 && observation.x < 2.00758837048506 && true);
}, Array(new DecisionTree(function(observation) {
return (observation.alpha >= -0.3970279 && observation.z < 3.31545225452094 && observation.x < 1.68392940206509 && true);
}, "gehen"), new DecisionTree(function(observation) {
return (observation.alpha < -0.3970279 && observation.z >= 3.31545225452094 && observation.x >= 1.68392940206509 && true);
}, Array(new DecisionTree(function(observation) {
return (observation.alpha < -0.7670267 && observation.gamma < -0.0625675857355396 && observation.beta >= 0.396817497364885 && observation.y >= 0.788343173048955 && observation.z < 0.694306236923246 && observation.x >= 0.0994269774030391 && true);
}, "gehen"), new DecisionTree(function(observation) {
return (observation.alpha >= -0.7670267 && observation.gamma >= -0.0625675857355396 && observation.beta < 0.396817497364885 && observation.y < 0.788343173048955 && observation.z >= 0.694306236923246 && observation.x < 0.0994269774030391 && true);
}, "treppe"))))), new DecisionTree(function(observation) {
return (observation.alpha >= 2.246275 && observation.gamma >= 0.239360184495145 && observation.y >= 3.05677522368127 && observation.z >= 3.57281176143735 && observation.x >= 2.00758837048506 && true);
}, Array(new DecisionTree(function(observation) {
return (observation.beta >= 0.4497663 && observation.gamma >= 0.176453597152523 && observation.y < -0.809977725708091 && observation.alpha >= 3.02496189616754 && observation.x >= 1.67093579197658 && true);
}, "gehen"), new DecisionTree(function(observation) {
return (observation.beta < 0.4497663 && observation.gamma < 0.176453597152523 && observation.y >= -0.809977725708091 && observation.alpha < 3.02496189616754 && observation.x < 1.67093579197658 && true);
}, "treppe"))))), new DecisionTree(function(observation) {
return (observation.beta < 0.3546908 && observation.alpha < -0.490116573516079 && observation.z < -2.13621659535312 && observation.y < -0.161441155983855 && observation.x >= 1.42103543220668 && observation.gamma < -0.168692149692251 && true);
}, Array(new DecisionTree(function(observation) {
return (observation.gamma >= 0.08843431 && observation.x >= 2.0967975893459 && observation.y >= 1.76223414798921 && observation.alpha >= 2.95169429860425 && observation.beta < 0.106237386441953 && true);
}, "gehen"), new DecisionTree(function(observation) {
return (observation.gamma < 0.08843431 && observation.x < 2.0967975893459 && observation.y < 1.76223414798921 && observation.alpha < 2.95169429860425 && observation.beta >= 0.106237386441953 && true);
}, Array(new DecisionTree(function(observation) {
return (observation.alpha >= -0.1403725 && observation.gamma >= -0.0561830214168218 && observation.x < 0.59494137248476 && observation.y < 0.0356084267950586 && observation.beta >= 0.319647559685427 && observation.z < 2.46648255229201 && true);
}, Array(new DecisionTree(function(observation) {
return (observation.alpha < 2.154761 && observation.gamma < -0.165100656874431 && observation.x < -1.93052579248922 && observation.y < -1.09551361389035 && observation.z < -5.87188647591301 && true);
}, "gehen"), new DecisionTree(function(observation) {
return (observation.alpha >= 2.154761 && observation.gamma >= -0.165100656874431 && observation.x >= -1.93052579248922 && observation.y >= -1.09551361389035 && observation.z >= -5.87188647591301 && true);
}, "treppe"))), new DecisionTree(function(observation) {
return (observation.alpha < -0.1403725 && observation.gamma < -0.0561830214168218 && observation.x >= 0.59494137248476 && observation.y >= 0.0356084267950586 && observation.beta < 0.319647559685427 && observation.z >= 2.46648255229201 && true);
}, "treppe"))))))))), new DecisionTree(function(observation) {
return (observation.beta < 0.1019632 && observation.gamma >= 0.0140342558017029 && observation.y < 0.0429268673146821 && observation.z < 0.0479489337021759 && observation.alpha < -0.0031571755751286 && true);
}, "stehen")))
