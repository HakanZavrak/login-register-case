using System.Net;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using FluentAssertions;
using Xunit;

public class AuthFlowTests : IClassFixture<CustomWebAppFactory>
{
    private readonly HttpClient _client;
    private static readonly JsonSerializerOptions JsonOpts = new(JsonSerializerDefaults.Web);

    private readonly string _email;
    private readonly string _password = "Aa1!test";

    public AuthFlowTests(CustomWebAppFactory factory)
    {
        _client = factory.CreateClient();
        _email = $"user{Guid.NewGuid():N}@test.com"; // Her testte unique email
    }

    [Fact]
    public async Task Register_Should_Return_200()
    {
        var reg = await _client.PostAsync("/api/auth/register", J(new { email = _email, password = _password }));
        reg.StatusCode.Should().Be(HttpStatusCode.OK);
    }

//aynı mail kayıt
    [Fact]
    public async Task Register_With_DuplicateEmail_Should_Return_409()
    {

        await _client.PostAsync("/api/auth/register", J(new { email = _email, password = _password }));

        var dup = await _client.PostAsync("/api/auth/register", J(new { email = _email, password = _password }));
        dup.StatusCode.Should().Be(HttpStatusCode.Conflict);
    }

//yanlış şifre
    [Fact]
    public async Task Login_With_WrongPassword_Should_Return_401()
    {
        await _client.PostAsync("/api/auth/register", J(new { email = _email, password = _password }));

        var bad = await _client.PostAsync("/api/auth/login", J(new { email = _email, password = "Wrong1!" }));
        bad.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

//token geliyor mu
    [Fact]
    public async Task Login_With_CorrectCredentials_Should_Return_Token()
    {
        await _client.PostAsync("/api/auth/register", J(new { email = _email, password = _password }));

        var ok = await _client.PostAsync("/api/auth/login", J(new { email = _email, password = _password }));
        ok.StatusCode.Should().Be(HttpStatusCode.OK);

        var body = await ok.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(body);
        var token = doc.RootElement.GetProperty("token").GetString();
        token.Should().NotBeNullOrWhiteSpace();
    }

//protected tokensın açılmamalı
    [Fact]
    public async Task Me_Without_Token_Should_Return_401()
    {
        var me401 = await _client.GetAsync("/api/me");
        me401.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }


    [Fact]
    public async Task Me_With_Token_Should_Return_UserInfo()
    {
        await _client.PostAsync("/api/auth/register", J(new { email = _email, password = _password }));
        var ok = await _client.PostAsync("/api/auth/login", J(new { email = _email, password = _password }));
        var body = await ok.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(body);
        var token = doc.RootElement.GetProperty("token").GetString();

        var req = new HttpRequestMessage(HttpMethod.Get, "/api/me");
        req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        var me200 = await _client.SendAsync(req);
        me200.StatusCode.Should().Be(HttpStatusCode.OK);
        (await me200.Content.ReadAsStringAsync()).Should().Contain(_email);
    }

    private static StringContent J(object o) =>
        new StringContent(JsonSerializer.Serialize(o, JsonOpts), Encoding.UTF8, "application/json");
}
