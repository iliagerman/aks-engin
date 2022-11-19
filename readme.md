* Was tested on Mac and Ubuntu 18.04 (container + vm)

# Pre-requisites:
- must be logged in with AZ CLI if sp.json is not present
- curl must be installed
- wget must be installed
- if build_containers=true (default: false) then docker should be avaliable and executable as not root user.
If installation is requred please run with root priviligaes. Docker hub credentials must be supplied via docker_hub_password, docker_hub_username and docker_hub_repo_name
- for usage example please run create.sh --help
# Variables:
You can provide variables via a file called variables (by default). Filename can be overwritten by $variables_file env variable
- subscription_id is mandatory
- docker_hub_username is optional
- docker_hub_repo_name is optional i.e. iliagerman/interview
- a complete list is avaliable in via --help
# Passwords:
You can provide passwords via a file called passwords (by default). Filename can be overwritten by $passwords_file env variable:
- mongo_db_root_password is mandatory
- docker_hub_password is optional
# Service Provider:
- if sp.json file is provided the sp will not be created and the file will be used instead

sp.json file example:
{
  "appId": "***",
  "displayName": "***",
  "password": "***",
  "tenant": "***"
}

# Overvie:
- Webserver - exposes the market data via /webserver preifx.
- Seeder - Adds new market data to Webserver every 10 seconds
- Service - Exposes a single get /service
- MongoDB - Stores the market date (will auto delete old date)