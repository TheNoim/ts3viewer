<template>
    <transition name="fade">
        <div>
            <v-list-tile avatar @click="">
                <v-list-tile-avatar>
                    <v-tooltip bottom>
                        <v-icon slot="activator" v-bind:color="channel.isDefault ? 'red' : ''" v-if="!channel.password">folder</v-icon>
                        <span v-if="!channel.isDefault">Channel</span>
                        <span v-if="channel.isDefault">Default channel</span>
                    </v-tooltip>
                    <v-tooltip bottom>
                        <v-icon slot="activator" v-bind:color="channel.isDefault ? 'red' : ''" v-if="channel.password">lock</v-icon>
                        <span v-if="!channel.isDefault">{{channel.name}} is locked with a password</span>
                        <span v-if="channel.isDefault">{{channel.name}} is locked with a password and the default channel</span>
                    </v-tooltip>
                </v-list-tile-avatar>
                <v-list-tile-content>
                    <v-list-tile-title>{{channel.name}}</v-list-tile-title>
                    <v-list-tile-sub-title>{{channel.topic}}</v-list-tile-sub-title>
                </v-list-tile-content>
            </v-list-tile>
            <v-divider></v-divider>
            <template v-if="channel.clients.length > 0" v-for="client in channel.clients">
                <client v-bind:key="client.dbid" v-bind:client="client" class="move"></client>
            </template>
            <template v-if="channel.children.length > 0" v-for="ch in channel.children">
                <channel v-bind:key="ch.id" v-bind:channel="ch" class="move"></channel>
            </template>
        </div>
    </transition>
</template>

<script>
    import client from './Client';

	export default {
		name: "channel",
		components: {client},
        props: {
			channel: Object
        }
	}
</script>

<style scoped>
    .move {
        margin-left: 30px;
    }
</style>