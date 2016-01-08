(function() {

'use strict';

var myModule = angular.module('application-security', []);
myModule.provider('applicationSecurity', function() {
    var provider = this;
    
    // Default Configuration
    var config = {
        /* List all the roles you wish to use in the app
        * You have a max of 31 before the bit shift pushes the accompanying integer out of
        * the memory footprint for an integer
        TODO allow the consumer to provide their own roles or if none are passed then use the default roles
        */
        roles :[
            'public',
            'user',
            'admin',
            'TENANT_USER',
            'TENANT_MANAGER',
            'SYSTEM_MANAGER',
            ],
        
        // Build out all the access levels you want referencing the roles listed above
        // You can use the "*" symbol to represent access to all roles.

        // The left-hand side specifies the name of the access level, and the right-hand side
        // specifies what user roles have access to that access level. E.g. users with user role
        // 'user' and 'admin' have access to the access level 'user'.
         
        accessLevels : {
            'public' : '*',
            'anon': ['public'],
            'user' : ['user', 'admin'],
            'admin': ['admin'],
            'TENANT_USER' : ['TENANT_USER'],
            'TENANT_MANAGER' : ['TENANT_MANAGER'],
            'SYSTEM_MANAGER' : ['SYSTEM_MANAGER']
        }
    };

    _.assign(provider, {
      accessLevels: [],
      userRoles: {}
    });

    

    function initialize() {
        provider.userRoles = buildRoles(config.roles);
        provider.accessLevels = buildAccessLevels(config.accessLevels, provider.userRoles);
    }

    initialize();
    /*
        Method to build a distinct bit mask for each role
        It starts off with "1" and shifts the bit to the left for each element in the
        roles array parameter
     */
    function buildRoles(roles){

        var bitMask = '01';
        var userRoles = {};

        for(var role in roles){
            var intCode = parseInt(bitMask, 2);
            userRoles[roles[role]] = {
                bitMask: intCode,
                title: roles[role]
            };
            bitMask = (intCode < 1 ).toString(2);
        }

        return userRoles;
    }

    /*
    This method builds access level bit masks based on the accessLevelDeclaration parameter which must
    contain an array for each access level containing the allowed user roles.
     */
    function buildAccessLevels(accessLevelDeclarations, userRoles){
        var accessLevels = {};
        for(var level in accessLevelDeclarations){

            if(typeof accessLevelDeclarations[level] === 'string'){
                if(accessLevelDeclarations[level] === '*'){

                    var resultBitMask = '';

                    for( var role in userRoles){
                        resultBitMask += '1';
                    }
                    //accessLevels[level] = parseInt(resultBitMask, 2);
                    accessLevels[level] = {
                        bitMask: parseInt(resultBitMask, 2)
                    };
                }
                // else {
                //     console.log('Error');
                // } 
            }
            else {

                var resultBitMask1 = 0;
                for(var role1 in accessLevelDeclarations[level]){
                    if(userRoles.hasOwnProperty(accessLevelDeclarations[level][role1])) {
                        /*jslint bitwise: true */
                        resultBitMask1 = resultBitMask1 | userRoles[accessLevelDeclarations[level][role1]].bitMask;
                    }
                        
                    // else {
                    //     console.log('Error');
                    // } //console.log("Access Control Error: Could not find role '" + accessLevelDeclarations[level][role] + "' in registered roles while building access for '" + level + "'")
                }
                accessLevels[level] = {
                    bitMask: resultBitMask1
                };
            }
        }

        return accessLevels;
    }

    provider.$get = function() {
        var service = {};

        return service;
    };

    return provider;
});

}());