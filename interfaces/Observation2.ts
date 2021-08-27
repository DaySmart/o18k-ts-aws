import { IEntityObservation } from './IEntityObservation';

export class Observation2<T extends IEntityObservation> implements IEntityObservation {
    constructor(params: ObservationParams<T>) {
        this.version = params.version;
        this.time = params.time;
        this.traceid = params.traceid;
        this.observer = params.observer;
        this.observerid = params.observerid;

        this.entityid = params.entityid;
        this.type = params.type;
        this.entity = params.entity;
        this.schema = params.schema;
        this.dataref = params.dataref;
        this.data = params.data;
    }

    time: string;
    version: string;
    traceid: string;
    observer: string;
    observerid: string;

    entityid: string;
    type: string;
    entity: string;
    schema: string;
    dataref: string;
    data: T['data'];
}

export interface ObservationParams<T extends IEntityObservation> {
    time?: string;
    version?: string;
    traceid?: string;
    observer?: string;
    observerid?: string;
    entityid: string;
    type: string;
    entity: string;
    schema: string;
    dataref: string;
    data: T['data'];
}

export const createNewObservation = <T extends IEntityObservation>(
    c: new (data: T['data']) => T,
    data: T['data'],
    traceid: string
): Observation2<T> => {
    const entityObservation = new c(data);
    return new Observation2<T>({
        time: new Date().toISOString(),
        version: '0.1',
        observer: 'com.daysmart.potato',
        observerid: 'sometypeofuri',
        traceid: generateTraceId(traceid),
        //entityObservation,
        entity: entityObservation.entity,
        type: entityObservation.type,
        entityid: entityObservation.entityid,
        schema: entityObservation.schema,
        dataref: entityObservation.dataref,
        data: entityObservation.data,
    });
};

export const createExistingObservation = <T extends IEntityObservation>(
    entityObservation: T,
    traceid: string,
    time: string,
    version: string,
    observer: string,
    observerid: string
): Observation2<T> => {
    return new Observation2<T>({
        time: time,
        version: version,
        observer: observer,
        observerid: observerid,
        traceid: traceid,
        entity: entityObservation.entity,
        type: entityObservation.type,
        entityid: entityObservation.entityid,
        schema: entityObservation.schema,
        dataref: entityObservation.dataref,
        data: entityObservation.data,
    });
};

export class Message {
    constructor(public observation: Observation2<any>, public destination: string) {}
}

export const generateTraceId = (currentTraceId?: string): string => {
    let traceRoot: string;
    let traceSpan: string;
    let traceSampled: string;
    let traceParent: string;

    if (currentTraceId) {
        traceRoot = currentTraceId.split('-')[0];
        traceSpan = getRanHex(16);
        traceSampled = '1';
        traceParent = currentTraceId.split('-')[1];
    } else {
        traceRoot = getRanHex(32);
        traceSpan = getRanHex(16);
        traceSampled = '1';
        traceParent = '0000000000000000';
    }
    return traceRoot + '-' + traceSpan + '-' + traceSampled + '-' + traceParent;
};

const getRanHex = (size) => {
    const result = [];
    const hexRef = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];

    for (let n = 0; n < size; n++) {
        result.push(hexRef[Math.floor(Math.random() * 16)]);
    }
    return result.join('');
};
