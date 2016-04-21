Smartix = Smartix || {};

Smartix.Messages = Smartix.Messages || {};

Smartix.Messages.ValidTypes = Smartix.Messages.ValidTypes || [];

Smartix.Messages.Addons = Smartix.Messages.Addons || {};

Smartix.Messages.Addons.ValidTypes = Smartix.Messages.Addons.ValidTypes || [];

Smartix.Messages.Schema = new SimpleSchema({
	group: {
		type: String
	},
	author: {
		type: String
	},
	type: {
		type: String,
		allowedValues: Smartix.Messages.ValidTypes
	},
    data: {
        type: Object,
        blackbox: true
    },
	hidden: {
		type: Boolean,
		defaultValue: false
	},
    createdAt:{
        type: Date,
        autoValue:function () {
            return new Date();
        }
    },
	deletedAt: {
		type: Number,
		decimal: false,
		optional: true
	},
	addons: {
		type: [Object],
		defaultValue: [],
        custom: function () {
            if(!Array.isArray(this.value)) {
                return "Th e Add-Ons field should be an array of objects";
            }
            
            console.log('addonsValidTypes@schema',Smartix.Messages.Addons.ValidTypes);
            
            for (var i = 0; i < this.value.length; i++) {
                if(typeof this.value.type[i] !== "string"
                || Smartix.Messages.Addons.ValidTypes.indexOf(this.value.type[i]) < 0) {
                    return "Invalid Add-Ons Object Array";
                }
            }
        }
	},
	versions: {
		type: [String],
		defaultValue: []
	}
});