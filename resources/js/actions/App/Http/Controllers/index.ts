import AuthController from './AuthController'
import PublicRequestController from './PublicRequestController'
import DashboardController from './DashboardController'
import WorkOrderController from './WorkOrderController'
import UserController from './UserController'
const Controllers = {
    AuthController: Object.assign(AuthController, AuthController),
PublicRequestController: Object.assign(PublicRequestController, PublicRequestController),
DashboardController: Object.assign(DashboardController, DashboardController),
WorkOrderController: Object.assign(WorkOrderController, WorkOrderController),
UserController: Object.assign(UserController, UserController),
}

export default Controllers