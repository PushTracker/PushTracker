import { Color } from "color";

const Packet = require("./packet/packet");

export class ControlMode {
    public static Options: Array<string> = ["MX1", "MX2", "MX2+"];
    
    public static Off: string = "Off";
    
    public static Beginner: string = "MX1";
    public static Intermediate: string = "MX2";
    public static Advanced: string = "MX2+";

    public static MX1: string = "MX1";
    public static MX2: string = "MX2";
    public static MX2plus: string = "MX2+";

    public static fromSettings(s: any): string {
	let o = Packet.bindingTypeToString("SmartDriveControlMode", s.ControlMode);
	return ControlMode[o];
    }
}

export class Units {
    public static Options: Array<string> = ["English", "Metric"];

    public static English: string = "English";
    public static Metric: string = "Metric";

    public static fromSettings(s: any): string {
	let o = Packet.bindingTypeToString("Units", s.Units);
	return Units[o];
    }
}

export class Settings {
    // public members
    public controlMode: string = ControlMode.Advanced;
    public ezOn: boolean = false;
    public units: string = Units.English;
    public acceleration: number = 30;
    public maxSpeed: number = 70;
    public tapSensitivity: number = 100;

    public ledColor: Color = new Color("#3c8aba");

    // private members

    // functions

    constructor(obj?: any) {
	if (obj !== null && obj !== undefined) {
	    if (typeof obj === typeof Array) {
		this.fromUint8Array(obj);
	    }
	    else {
		this.fromObject(obj);
	    }
	}
    }

    public fromObject(obj: any): void {
	this.controlMode = obj && obj.controlMode || ControlMode.Advanced;
	this.ezOn = obj && obj.ezOn || false;
	this.units = obj && obj.units || Units.English;
	this.acceleration = obj && obj.acceleration || 30;
	this.maxSpeed = obj && obj.maxSpeed || 70;
	this.tapSensitivity = obj && obj.tapSensitivity || 100;

	this.ledColor = obj && obj.ledColor && new Color(obj.ledColor) || new Color("#3c8aba");
    }

    public fromUint8Array(arr: Uint8Array): void {
	const p = new Packet.Packet(arr);
	this.fromPacket(p);
	p.destroy();
    }

    public fromPacket(p): void {
	const s = p.data("settings");
	this.controlMode = ControlMode.fromSettings(s) || ControlMode.Advanced;
	this.ezOn = (s.Flags & 0x01) ? true : false || false;
	this.units = Units.fromSettings(s) || Units.English;
	this.acceleration = s.Acceleration || 30;
	this.maxSpeed = s.MaxSpeed || 70;
	this.tapSensitivity = s.TapSensitivity || 100;
    }

}
