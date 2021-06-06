import { PluginSimple, PluginWithOptions, PluginWithParams } from 'markdown-it';
import { Atom } from '../abstract';
import { LoadState } from '../constant';
import { IdleContext } from '../editor';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MarkdownItPlugin = PluginSimple | [PluginWithOptions, any] | [PluginWithParams, ...any[]];

const markdownItPluginLoader = (id: string) =>
    class ProsemirrorPluginLoader extends Atom<LoadState.Idle, { plugins: (ctx: IdleContext) => MarkdownItPlugin[] }> {
        override readonly id = id;
        override readonly loadAfter = LoadState.Idle;
        override main() {
            const plugins = this.options.plugins(this.context);
            const md = plugins.reduce((instance, plugin) => {
                if (Array.isArray(plugin)) {
                    return instance.use(...(plugin as [PluginWithOptions]));
                }

                return instance.use(plugin);
            }, this.context.markdownIt);
            this.updateContext({
                markdownIt: md,
            });
        }
    };

export const createMarkdownItPlugin = (id: string, plugins: (ctx: IdleContext) => MarkdownItPlugin[]): Atom => {
    const Factory = markdownItPluginLoader(id);
    return new Factory({ plugins }) as Atom;
};
