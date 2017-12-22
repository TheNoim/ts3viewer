<template>
    <v-list two-line v-bind:class="[move ? move : '']">
        <template v-for="channel in channels">
            <transition name="fade" v-bind:key="channel.id">
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
                            <v-list-tile-title v-html="channel.name"></v-list-tile-title>
                            <v-list-tile-sub-title v-html="channel.topic"></v-list-tile-sub-title>
                        </v-list-tile-content>
                    </v-list-tile>
                    <v-divider></v-divider>
                    <treeClients v-if="channel.clients.length > 0" v-bind:clients="channel.clients"></treeClients>
                    <treeChild v-if="channel.children.length > 0" v-bind:channels="channel.children" v-bind:move="true"></treeChild>
                </div>
            </transition>
        </template>
    </v-list>
</template>

<script>
	import treeChild from './TreeChild';
	import treeClients from './TreeClients';

	export default {
		name: "tree",
        components: {treeChild, treeClients},
        props: {
			channels: Array,
            move: Boolean
        }
	}
</script>

<style scoped>
    .fade-enter-active, .fade-leave-active {
        transition: opacity .5s
    }

    .fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */
    {
        opacity: 0
    }
</style>