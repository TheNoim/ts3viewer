<template>
    <v-list two-line class="move" full-width>
        <template v-for="channel in channels">
            <div v-bind:key="channel.id">
                <v-list-tile avatar @click="">
                    <v-list-tile-avatar>
                        <v-icon v-if="!channel.password">folder</v-icon>
                        <v-icon v-if="channel.password">lock</v-icon>
                    </v-list-tile-avatar>
                    <v-list-tile-content>
                        <v-list-tile-title v-html="channel.name"></v-list-tile-title>
                        <v-list-tile-sub-title v-html="channel.topic"></v-list-tile-sub-title>
                    </v-list-tile-content>
                </v-list-tile>
                <treeClients v-if="channel.clients.length > 0" v-bind:clients="channel.clients"></treeClients>
                <treeChild v-if="channel.children.length > 0" v-bind:channels="channel.children"></treeChild>
            </div>
        </template>
    </v-list>
</template>

<script>
	import treeClients from './TreeClients';

	export default {
		name: "treeChild",
		components: {treeClients},
		props: {
			channels: Array
		}
	}
</script>

<style scoped>
    .move {
        margin-left: 30px;
    }
</style>