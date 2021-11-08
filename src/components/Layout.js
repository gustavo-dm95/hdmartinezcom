import React from 'react';
import { Helmet } from 'react-helmet';
import _ from 'lodash';

import { withPrefix, classNames } from '../utils';
import Header from './Header';
import Footer from './Footer';

export default class Body extends React.Component {
    constructor(props) {
        super(props);
        this.handleVideoEmbeds = this.handleVideoEmbeds.bind(this);
    }

    componentDidMount() {
        this.handleVideoEmbeds();
    }

    componentDidUpdate() {
        this.handleVideoEmbeds();
    }

    handleVideoEmbeds() {
        const videoEmbeds = ['iframe[src*="youtube.com"]', 'iframe[src*="vimeo.com"]'];
        noframe(videoEmbeds.join(','), '.inner-sm');
    }

    render() {
        const page = _.get(this.props, 'page');
        const pageTitle = _.get(page, 'title');
        const config = _.get(this.props, 'config');
        const configTitle = _.get(config, 'title');
        const palette = _.get(config, 'palette', 'green')
        const layoutStyle = _.get(config, 'layout_style', 'simple')
        const favicon = _.get(config, 'favicon');
        const domain = _.trim(_.get(config, 'domain', ''), '/');
        const seo = _.get(page, 'seo');
        const seoTitle = _.get(seo, 'title');
        const title = seoTitle ? seoTitle : [pageTitle, configTitle].join(' | ');
        const seoDescription = _.get(seo, 'description', '');
        const seoRobots = _.get(seo, 'robots', []).join(',');
        const seoExtra = _.get(seo, 'extra', []).map((meta, metaIdx) => {
            const keyName = _.get(meta, 'keyName', 'name');
            const name = _.get(meta, 'name');
            if (!name) {
                return null;
            }
            const nameAttr = { [keyName]: name };
            const relativeUrl = _.get(meta, 'relativeUrl');
            let value = _.get(meta, 'value');
            if (!value) {
                return null;
            }
            if (relativeUrl) {
                if (!domain) {
                    return null;
                }
                value = domain + withPrefix(value);
            }
            return <meta key={metaIdx} {...nameAttr} content={value} />;
        });

        return (
            <React.Fragment>
                <Helmet>
                    <title>{title}</title>
                    <meta charSet="utf-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1" />
                    <meta name="google" content="notranslate" />
                    <meta name="description" content={seoDescription} />
                    {!_.isEmpty(seoRobots) && <meta name="robots" content={seoRobots} />}
                    {seoExtra}
                    <link href="https://fonts.googleapis.com/css?family=Roboto:400,400i,700,700i&display=swap" rel="stylesheet" />
                    {favicon && <link rel="icon" href={withPrefix(favicon)} />}
                    <link rel="apple-touch-icon" sizes="57x57" href="/apple-icon-57x57.png" />
                    <link rel="apple-touch-icon" sizes="60x60" href="/apple-icon-60x60.png" />
                    <link rel="apple-touch-icon" sizes="72x72" href="/apple-icon-72x72.png" />
                    <link rel="apple-touch-icon" sizes="76x76" href="/apple-icon-76x76.png" />
                    <link rel="apple-touch-icon" sizes="114x114" href="/apple-icon-114x114.png" />
                    <link rel="apple-touch-icon" sizes="120x120" href="/apple-icon-120x120.png" />
                    <link rel="apple-touch-icon" sizes="144x144" href="/apple-icon-144x144.png" />
                    <link rel="apple-touch-icon" sizes="152x152" href="/apple-icon-152x152.png" />
                    <link rel="apple-touch-icon" sizes="180x180" href="/apple-icon-180x180.png" />
                    <link rel="icon" type="image/png" sizes="192x192"  href="/android-icon-192x192.png" />
                    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
                    <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
                    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
                    <link rel="manifest" href="/manifest.json" />
                    <meta name="msapplication-TileColor" content="#ffffff" />
                    <meta name="msapplication-TileImage" content="/ms-icon-144x144.png" />
                    <meta name="theme-color" content="#ffffff" />
                    <body className={classNames(`palette-${palette}`, `style-${layoutStyle}`)} />
                </Helmet>
                <div id="page" className="site">
                    <Header page={page} config={config} />
                    <div id="content" className="site-content">
                        <div className="inner">
                            <main id="main" className="site-main">
                                {this.props.children}
                            </main>
                            <Footer config={config} />
                        </div>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}
