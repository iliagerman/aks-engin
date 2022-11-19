#!/bin/bash
SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)

# Determine the operating system
unameOut="$(uname -s)"
case "${unameOut}" in
    Linux*)     op_system=linux;;
    Darwin*)    op_system=mac;;
    *)          op_system="UNKNOWN:${unameOut}"
esac
echo "op_system: ${op_system}"

passwords_file=${passwords_file:-$SCRIPT_DIR/passwords}
variables_file=${variables_file:-$SCRIPT_DIR/variables}
if test -f "$passwords_file"; then
    echo "loading passwords from $passwords_file"
    source $passwords_file
fi
if test -f "$variables_file"; then
    echo "loading variables from $variables_file"
    source $variables_file
fi
working_folder="$(pwd)/working_folder"
build_containers=${build_containers:-false}
location=${location:-eastus}
credentials_file=${credentials_file:-sp.json}
sp_role=${sp_role:-Owner}
k8s_config=${k8s_config:-configs/kubernetes.json}
resource_group=${resource_group:-eks-engine-$location}
folders_to_build=${folders_to_build:-service,webserver}
docker_hub_repo_name=${docker_hub_repo_name:-iliagerman/interview}
mongo_db_root_username=${mongo_db_root_username:-root}

programname=$0
function usage {
    echo ""
    echo "Creates a service prinsicpal for the Azure CLI"
    echo ""
    echo "usage: $programname --subscription_id string --sp_role string --credentials_file string --resource_group string --k8s_config string --location string"
    echo "options:"
    echo "  --subscription_id string subcription id to create the k8s cluster in"
    echo "                           (example: d53c9f83-8238-46fc-a1a7-943549c4aad6)"
    echo "  --sp_role (optional) string which role the service principal will have (default: Owner)"
    echo "                           (example: Owner/Contributer)"
    echo "  --passwords_file string (optional) path to a file with passwords"
    echo "  --variables_file string (optional) path to a file with with variables"
    echo "  --credentials_file string (optional) Credentials for the sp file name (default: sp.json)"
    echo "  --resource_group string (optional) resource group to use (default: create new one)"
    echo "  --k8s_config string (optional) the kubernetes.json file path (default: configs/kubernetes.json)"
    echo "  --location string (optional) region where to create the cluster (default: westus2)"
    echo "  --folders_to_build string (optional) list of folders containing Dockerfiles to build (default: webserver_folder)"
    echo "  --docker_hub_repo_name string (optional) repowhere to publish the docker images, if private please login prior runnoing the script (default: iliagerman/interview)"
    echo "  --docker_hub_username string username for docker registry"
    echo "  --docker_hub_password string password for docker registry"
    echo "  --mongo_db_root_username string (optional) string root usernmae for mongodb (default: root)"
    echo "  --mongo_db_root_password string password for mongodb root user"
    echo "  --build_containers (optional) bool if truie will build the containers (default: false)"
    echo ""
}

function die {
    printf "Script failed: %s\n\n" "$1"
    exit 1
}

function run {
    command=$1
    if ! grep -q "$command" "$passwords_file"; then
        printf "Running: %s\n" "$command"
    fi
    eval $command || die "Failed to run: $command"
}

while [ $# -gt 0 ]; do
    if [[ $1 == "--help" ]]; then
        usage
        exit 0
    elif [[ $1 == "--"* ]]; then
        v="${1/--/}"
        declare "$v"="$2"
        shift
    fi
    shift
done

if [[ "$1" == "--help" ]]; then
    usage
    exit 0
fi

if [[ -z $subscription_id ]]; then
    usage
    die "Missing parameter --subscription_id"
else
    echo "subscription_id: $subscription_id"
fi

if [[ -z $mongo_db_root_password ]]; then
    usage
    die "Missing parameter --mongo_db_root_password"
else
    echo "mongo_db_root_password: $mongo_db_root_password"
fi

if [[ -z $k8s_config ]]; then
    usage
    die "Missing parameter --k8s_config"
else
    echo "k8s_config: $k8s_config"
fi

if [[ -z $docker_hub_password ]]; then
    usage
    die "Missing parameter --docker_hub_password"
else
    echo "k8s_config: $docker_hub_password"
fi

function create_sp() {
    #if sp.json file exists it will use it, if not new sp provider will be created; requires you to be logged in to azure cli
    if test -f "$credentials_file"; then
        echo "$credentials_file exists."
    else
        run "az ad sp create-for-rbac --scopes /subscriptions/$subscription_id --role $sp_role"
        echo "$output" >sp.json
    fi
}

function install_helmfile() {
    helmfile && echo "helm file already installed" && return 0
    if [[ $op_system == "mac" ]]; then
        run "brew install helmfile"
    elif [[ $op_system == "linux" ]]; then
        run "wget -O helmfile_linux_amd64 https://github.com/roboll/helmfile/releases/download/v0.135.0/helmfile_linux_amd64"
        run "chmod +x helmfile_linux_amd64"
        run "mv helmfile_linux_amd64 $working_folder/helmfile"
    else
        die "op_system not supported"
    fi
}

function install_helm() {
    helm && echo "helm already installed" && return 0
    if [[ $op_system == "mac" ]]; then
        run "brew install helm"
    elif [[ $op_system == "linux" ]]; then
        run "curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3"
        run "chmod 700 get_helm.sh"
        run "./get_helm.sh && rm get_helm.sh"
    else
        die "op_system not supported"
    fi
}

function install_docker(){
    docker && echo "docker already installed" && return 0
    if [[ $op_system == "mac" ]]; then
        run "brew install docker"
    elif [[ $op_system == "linux" ]]; then
        run "curl -fsSL https://get.docker.com -o get-docker.sh"
        run "sh get-docker.sh"
        run "sudo usermod -aG docker $USER"
    else
        die "op_system not supported"
    fi
}

function install_kubectl() {
    kubectl && echo "kubectl already installed" && return 0
    if [[ $op_system == "mac" ]]; then
        run "brew install kubectl"
    elif [[ $op_system == "linux" ]]; then
        run "curl -LO https://dl.k8s.io/release/v1.25.0/bin/linux/amd64/kubectl"
        run "mv ./kubectl $working_folder/kubectl"
        run "chmod +x $working_folder/kubectl"

    else
        die "op_system not supported"
    fi
}

function install_jq(){
    jq && echo "jq already installed" && return 0
    run "wget -O jq https://github.com/stedolan/jq/releases/download/jq-1.6/jq-linux64"
    run "chmod +x ./jq"
    run "mv jq $working_folder"
}

# install aks-engine
function install_aks_engine() {
    aks-engine && echo "aks-engine already installed" && return 0
    if [[ "$op_system" = "mac" ]]; then
        run "brew tap azure/aks-engine && brew install azure/aks-engine/aks-engine"
    elif [[ "$op_system" = "linux" ]]; then
        run "curl -L https://aka.ms/aks-engine/aks-engine-k8s-e2e.tar.gz | tar -xz"
        run "mv aks-engine--linux-amd64/aks-engine $working_folder"
        run "rm -rf aks-engine--linux-amd64"
    else
        die "op_system not supported"
    fi
}

# create k8s cluster
function create_cluster() {
    output_path=$(realpath _output/$resource_group/kubeconfig/kubeconfig.$location.json)
    client_secret=$(cat $credentials_file | jq -r '.password')
    client_id=$(cat $credentials_file | jq -r '.appId')
    echo "output_path: $output_path"
    if test -f "$output_path"; then
        echo "Cluster already exists"
    else
        run "aks-engine deploy --subscription-id $subscription_id --dns-prefix $resource_group --location $location --api-model $k8s_config --output-directory _output/$resource_group --client-secret $client_secret --client-id $client_id"
        output_path=$(realpath _output/$resource_group/kubeconfig/kubeconfig.$location.json)
    fi
    export KUBECONFIG=$output_path
    run "kubectl cluster-info"
    run "kubectl get nodes"

    #workaround for pv not created
    run "helm uninstall azuredisk-csi-driver -n kube-system"
    run "helm repo add azuredisk-csi-driver https://raw.githubusercontent.com/kubernetes-sigs/azuredisk-csi-driver/master/charts"
    run "helm install azuredisk-csi-driver azuredisk-csi-driver/azuredisk-csi-driver --namespace kube-system"
}

function build_publish_containers() {
    run "docker login -u $docker_hub_username -p $docker_hub_password"
    for folder in ${folders_to_build//,/ }; do
        run "docker buildx build --platform=linux/amd64 --pull --rm -f \"$folder/Dockerfile\" -t $docker_hub_repo_name:$folder \"$folder\""
        run "docker push $docker_hub_repo_name:$folder"
    done
}

function deploy_components() {
    pushd components
    username=$(echo "root" | base64)
    password=$(echo "$mongo_db_root_password" | base64)
    echo "MONGO_DB_USERNMAE: $username" >default.yaml
    echo "MONGO_DB_PASSWORD: $password" >>default.yaml
    echo "MONGO_DB_PASSWORD_PLAIN: $mongo_db_root_password" >>default.yaml
    run "helm repo add bitnami https://charts.bitnami.com/bitnami"
    run "helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx"
    run "helmfile repos"
    run "helmfile sync"
    popd
}

function main() {
    #create a temporary directory for all the intermediate files
    export PATH="$working_folder:$PATH"
    rm -rf $working_folder
    mkdir $working_folder
    run "export PATH=\"$working_folder:$PATH\""

    create_sp
    install_jq
    install_kubectl
    install_helm
    install_helmfile
    install_aks_engine
    create_cluster
    # Verify docker is installed if not install it (if root user)
    if [[ "$build_containers" = true ]]; then
        docker_install_path=$(which docker)
        if [ -z $docker_install_path ]; then
            if [ "$EUID" -ne 0 ]; then
                echo "Please run as root if you want to build containers" && die
            else
                install_docker
            fi
        fi
        build_publish_containers
    fi
    #deploy the application
    deploy_components

    #get the public ip
    external_ip=$(kubectl get services --namespace ingress-nginx ingress-nginx-controller --output jsonpath='{.status.loadBalancer.ingress[0].ip}')
    echo "external_ip: $external_ip"

    echo "webserver: http://$external_ip/webserver"
    echo "service: http://$external_ip/service"
    #if the installation was successful, delete the temporary directory if not
    #keep it for debugging purposes
    rm -rf $working_folder
}

main
