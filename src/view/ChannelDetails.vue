<template>
    <v-dialog v-model="isOpen" lazy max-width="500px">
        <v-card>
            <v-card-title>
                <h3>Details of {{channel.name}}</h3>
            </v-card-title>
            <v-card-text>
                <v-layout justify-center align-content-center align-center v-if="channel.iconID !== 0">
                    <img :tile="true" :src="`/icon/${channel.iconID}`" v-img :alt="`${channel.name} icon`" class="clientAvatar">
                </v-layout>
                <v-expansion-panel popout focusable expand>
                    <v-expansion-panel-content lazy ripple v-if="channel.description">
                        <div slot="header">Description</div>
                        <v-card>
                            <v-card-text v-html="bbcode(channel.description)">
                            </v-card-text>
                        </v-card>
                    </v-expansion-panel-content>
                    <v-expansion-panel-content lazy ripple>
                        <div slot="header">More details</div>
                        <v-card>
                            <v-card-text>
                                Topic: <code>{{channel.topic}}</code><br/>
                                Password: <code>{{channel.password ? 'Yes' : 'No'}}</code><br/>
                                Client Limit: <code>{{channel.maxClients ? channel.maxClientCount : 'No'}}</code><br/>
                                Forced Silence: <code>{{channel.silence ? 'Yes' : 'No'}}</code><br/>
                                Secure (Encrypted): <code>{{channel.secure ? 'Yes' : 'No'}}</code><br/>
                                Is default channel: <code>{{channel.isDefault ? 'Yes' : 'No'}}</code><br/>
                                Is private: <code>{{channel.isPrivate ? 'Yes' : 'No'}}</code><br/>
                                Permanent: <code>{{channel.permanent ? 'Yes' : 'No'}}</code><br/>
                            </v-card-text>
                        </v-card>
                    </v-expansion-panel-content>
                </v-expansion-panel>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script>
	import BBCode from './xbbcode';

	export default {
		name: "channel-details",
		props: ['show', 'channel'],
		data() {
			return {isOpen: this.show};
		},
		mounted() {
			this.$watch('isOpen', () => {
				if (!this.$data.isOpen) {
					this.close();
				}
			});
			this.$watch('show', () => {
				this.$set(this.$data, 'isOpen', this.show);
			})
		},
		methods: {
			bbcode(string) {
				const r = BBCode.process({text: string ? string : ''});
				console.log(r);
				if (r.hasOwnProperty('html')) {
					return r['html'].replace(/(\r\n|\n|\r)/gm,"<br/>");
                } else {
					return string;
                }
			},
			close() {
				this.$emit('close');
			}
		}
	}
</script>

<style scoped>
    .clientAvatar {
        object-fit: contain;
    }
</style>