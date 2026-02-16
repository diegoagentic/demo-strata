import React from 'react';
import { ColorPalette, ColorItem, Typeset as StorybookTypeset } from '@storybook/blocks';
import tokensRaw from '../../tokens/tokens-raw.json';

// --- Helpers ---

// Helper to sort object keys numerically if possible
const sortKeys = (obj: Record<string, any>) => {
    return Object.keys(obj).sort((a, b) => {
        const numA = parseFloat(a);
        const numB = parseFloat(b);
        if (!isNaN(numA) && !isNaN(numB)) {
            return numA - numB;
        }
        return a.localeCompare(b);
    });
};

const getTokens = (category: string) => (tokensRaw.light as Record<string, any>)[category] || {};

// --- Galleries ---

export const ColorGallery = () => {
    const { color } = tokensRaw.light;

    // Primitives
    const palettes = Object.entries(color)
        .filter(([key, value]) => {
            // Very basic heuristic to find palettes vs semantic
            return ['zinc', 'red', 'green', 'blue', 'amber', 'indigo', 'white', 'black'].includes(key);
        })
        .map(([family, shades]) => {
            if (shades.value) {
                return <ColorItem key={family} title={family.charAt(0).toUpperCase() + family.slice(1)} subtitle="" colors={{ [family]: shades.value }} />;
            }

            const colors = {};
            Object.entries(shades).sort((a, b) => parseInt(a[0]) - parseInt(b[0])).forEach(([shade, token]) => {
                colors[shade] = token.value;
            });

            return (
                <ColorItem
                    key={family}
                    title={family.charAt(0).toUpperCase() + family.slice(1)}
                    subtitle={`color.${family}`}
                    colors={colors}
                />
            );
        });

    return (
        <div className="sb-unstyled">
            <h2>Primitive Colors</h2>
            <ColorPalette>{palettes}</ColorPalette>
        </div>
    );
};

export const TypographyGallery = () => {
    const { fontFamily, fontSize, fontWeight, lineHeight, letterSpacing } = tokensRaw.light;

    const sampleText = "The quick brown fox jumps over the lazy dog";

    return (
        <div className="sb-unstyled">
            <section>
                <h3>Font Family</h3>
                <div style={{ display: 'grid', gap: '20px' }}>
                    {Object.entries(fontFamily).map(([name, token]) => (
                        <div key={name}>
                            <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>{name}</div>
                            <div style={{ fontFamily: token.value, padding: '16px', border: '1px solid #eee', borderRadius: '4px' }}>
                                <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Aa</div>
                                <div>{token.value}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section style={{ marginTop: '32px' }}>
                <h3>Font Sizes</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '1px solid #eee' }}>
                            <th style={{ padding: '8px' }}>Name</th>
                            <th style={{ padding: '8px' }}>Size</th>
                            <th style={{ padding: '8px' }}>Example</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortKeys(fontSize).map(key => (
                            <tr key={key} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '8px' }}>{key}</td>
                                <td style={{ padding: '8px' }}>{(fontSize as any)[key].value}</td>
                                <td style={{ padding: '8px', fontSize: (fontSize as any)[key].value }}>Aa</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            <section style={{ marginTop: '32px' }}>
                <h3>Font Weights</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                    {sortKeys(fontWeight).map(key => (
                        <div key={key} style={{ border: '1px solid #eee', padding: '16px', borderRadius: '4px', minWidth: '120px' }}>
                            <div style={{ fontWeight: (fontWeight as any)[key].value, fontSize: '1.5rem' }}>Aa</div>
                            <div style={{ fontWeight: 'bold', marginTop: '8px' }}>{key}</div>
                            <div style={{ color: '#666', fontSize: '0.8rem' }}>{(fontWeight as any)[key].value}</div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export const SpacingGallery = () => {
    const spacing = getTokens('spacing');

    return (
        <div className="sb-unstyled">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '1px solid #eee' }}>
                        <th style={{ padding: '8px' }}>Name</th>
                        <th style={{ padding: '8px' }}>Size</th>
                        <th style={{ padding: '8px' }}>Visual</th>
                    </tr>
                </thead>
                <tbody>
                    {sortKeys(spacing).map(key => (
                        <tr key={key} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '8px' }}>{key}</td>
                            <td style={{ padding: '8px' }}>{(spacing as any)[key].value}</td>
                            <td style={{ padding: '8px' }}>
                                <div style={{
                                    width: (spacing as any)[key].value,
                                    height: '16px',
                                    backgroundColor: '#3b82f6',
                                    borderRadius: '2px'
                                }} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export const BorderGallery = () => {
    const borderRadius = getTokens('borderRadius');
    const borderWidth = getTokens('borderWidth');

    return (
        <div className="sb-unstyled">
            <h3>Border Radius</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', marginBottom: '40px' }}>
                {Object.entries(borderRadius).map(([key, token]) => (
                    <div key={key} style={{ textAlign: 'center' }}>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            border: '1px solid #000',
                            borderRadius: (token as any).value,
                            marginBottom: '8px'
                        }} />
                        <div>{key}</div>
                        <div style={{ fontSize: '0.8rem', color: '#666' }}>{(token as any).value}</div>
                    </div>
                ))}
            </div>

            <h3>Border Width</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
                {Object.entries(borderWidth).map(([key, token]) => (
                    <div key={key} style={{ textAlign: 'center' }}>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            backgroundColor: '#f4f4f5',
                            border: `${(token as any).value} solid #000`,
                            marginBottom: '8px'
                        }} />
                        <div>{key}</div>
                        <div style={{ fontSize: '0.8rem', color: '#666' }}>{(token as any).value}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const ShadowGallery = () => {
    const shadow = getTokens('shadow');

    return (
        <div className="sb-unstyled">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '32px' }}>
                {Object.entries(shadow).map(([key, token]) => (
                    <div key={key} style={{
                        padding: '24px',
                        borderRadius: '8px',
                        boxShadow: (token as any).value,
                        backgroundColor: '#fff',
                        border: '1px solid #f4f4f5'
                    }}>
                        <div style={{ fontWeight: 'bold' }}>{key}</div>
                        <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '8px', wordBreak: 'break-all' }}>{(token as any).value}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Default export for backward compatibility if needed, but we prefer named
export default {
    ColorGallery,
    TypographyGallery,
    SpacingGallery,
    BorderGallery,
    ShadowGallery
};
