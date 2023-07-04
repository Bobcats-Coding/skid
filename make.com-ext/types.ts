type UserInfo = {
    id: number;
    name: string;
    email: string;
}

export type Scenario = {
    id: number;
    name: string;
    teamId?: number;
    hookId?: number;
    deviceId?: number;
    description?: string;
    folderId?: number;
    isinvalid: boolean;
    islinked: boolean;
    islocked: boolean;
    isPaused: boolean;
    lastEdit: string;
    scheduling?: {
        type: string;
        interval: number;
    };
    iswaiting: boolean;
    usedPackages: string[];
    nextExec: string;
    createdByUser: UserInfo;
    updatedByUser: UserInfo;
}

export type ScenarioActionResponse = Pick<Scenario, 'id' | 'islinked'>;