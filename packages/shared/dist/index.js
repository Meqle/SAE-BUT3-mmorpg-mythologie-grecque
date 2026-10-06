"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PacketType = exports.GODS_LORE = void 0;
exports.GODS_LORE = {
    ZEUS: {
        id: "ZEUS",
        name: "Zeus",
        title: "Roi de l'Olympe",
        realm: "olympus",
        color: "#facc15",
        passiveBonus: "+15% Vitesse",
        description: "Règne sur les cieux et les éclairs depuis le mont Olympe."
    },
    POSEIDON: {
        id: "POSEIDON",
        name: "Poséidon",
        title: "Souverain des Océans",
        realm: "olympus",
        color: "#38bdf8",
        passiveBonus: "+20% Résistance",
        description: "Dompte les flots et fait trembler la terre de son trident."
    },
    HADES: {
        id: "HADES",
        name: "Hadès",
        title: "Seigneur des Enfers",
        realm: "tartarus",
        color: "#a855f7",
        passiveBonus: "+10% Dégâts d'ombre",
        description: "Gouverne le royaume des morts et les profondeurs souterraines."
    },
    ATHENA: {
        id: "ATHENA",
        name: "Athéna",
        title: "Déesse de la Sagesse",
        realm: "elysium",
        color: "#2dd4bf",
        passiveBonus: "+15% Parade",
        description: "Protectrice des héros et stratège militaire sans égal."
    },
    ARES: {
        id: "ARES",
        name: "Arès",
        title: "Dieu de la Guerre",
        realm: "tartarus",
        color: "#ef4444",
        passiveBonus: "+25% Force brute",
        description: "Incarnation de la fureur guerrière et des champs de bataille."
    },
    APOLLO: {
        id: "APOLLO",
        name: "Apollon",
        title: "Dieu de la Lumière",
        realm: "elysium",
        color: "#fb923c",
        passiveBonus: "+15% Portée",
        description: "Guide les oracles et tire des flèches solaires à distance."
    }
};
var PacketType;
(function (PacketType) {
    PacketType["JOIN_REQUEST"] = "JOIN_REQUEST";
    PacketType["PLAYER_INPUT"] = "PLAYER_INPUT";
    PacketType["SWITCH_VIEW_REQUEST"] = "SWITCH_VIEW_REQUEST";
    PacketType["CHAT_SEND"] = "CHAT_SEND";
    PacketType["JOIN_RESPONSE"] = "JOIN_RESPONSE";
    PacketType["WORLD_TICK"] = "WORLD_TICK";
    PacketType["PLAYER_JOINED"] = "PLAYER_JOINED";
    PacketType["PLAYER_LEFT"] = "PLAYER_LEFT";
    PacketType["VIEW_SWITCHED"] = "VIEW_SWITCHED";
    PacketType["CHAT_BROADCAST"] = "CHAT_BROADCAST";
    PacketType["ERROR"] = "ERROR";
})(PacketType || (exports.PacketType = PacketType = {}));
//# sourceMappingURL=index.js.map