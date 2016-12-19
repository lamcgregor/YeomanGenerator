# YeomanGenerator

A front end environment builder using Yeoman

Should be installed after node and grunt(or gulp!) has been installed.

Once grunt and npm work globally then install yeoman:

    npm install -g yo

Once that has been run then the generator

    npm install -g https://github.com/aqueduct/YeomanGenerator.git
    
Create the folder you wish to create the environment in

    mkdir Company.Frontend
    
Navigate in to it

    cd Company.Frontend
    
And run the generator

    yo new-project
    
Follow the prompts, and it should install and run everything automagically. The default command ("grunt" or "gulp") runs the local server etc.

##Updating

If you ever need to update the environment builder, just update it with npm

    npm update -g generator-new-project
