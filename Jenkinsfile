@Library(value="kids-first/aws-infra-jenkins-shared-libraries", changelog=false) _
deploy {
    architecture_type       = "aws-ecs-service-type-1"
    prd_cidr                = "0.0.0.0/0"
    projectName             = "kf-users-api"
    environments            = "qa,prd"
    docker_image_type       = "alpine"
    internal_app            = "false"
    create_default_iam_role = "0"
    entrypoint_command      = "npm run start:prd"
    deploy_scripts_version  = "master"
    container_port          = "443"
    vcpu_container          = "2048"
    memory_container        = "4096"
    vcpu_task               = "2048"
    memory_task             = "4096"
    health_check_path       = "/status"
    dependencies            = "ecr"
}
