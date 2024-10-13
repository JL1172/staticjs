//this is a comment 
    //after this, static type analysis has been performed
    const multiLineCommentEnd: RegExp = /\*\//;
    //! big int and promises will need to be supported later
    //! need to go through each variable first filter all non composite and custom types and then look at each variable separately. all interctions with variable will be traced and added to the variable node array
    //! need to go through each variable first filter all custom types and then look at each variable separately. all interctions with variable will be traced and added to the variable node array
    //! need to go through each variable first filter all composite types and then look at each variable separately. all interctions with variable will be traced and added to the variable node array
    //! i will go through each variable node that has a primitive type enforced and will look at each interaction that i traced and then will validate no illegal interaction occurs
    //! i will go through each variable node that has a customn type enforced and will look at each interaction that i traced and then will validate no illegal interaction occurs
    //! i will go through each variable node that has a composite type enforced and will look at each interaction that i traced and then will validate no illegal interaction occurs
  //! maps and sets only support primitive and composite types inhabiting their structure. may change later
        //? may have messed something here in this regex
          } //else it is i a primitive type
  //got to figure out how to evaluate types